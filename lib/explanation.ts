import {
  AiProviderError,
  MissingApiKeyError,
  callAiWithFallback,
  type ChatMessage,
} from "./ai/provider";
import type { DocumentChunk } from "@/types/document";
import type { DocumentExplanation, EvidenceType, ExplanationSection } from "@/types/explanation";

export {
  getAvailableProviders,
  MissingApiKeyError,
  AiProviderError,
} from "./ai/provider";

const SECTION_SPEC = `
- simple ("The stupidly simple version"): 1-2 sentences, as plain as it gets.
- actuallySaying ("What are they actually saying?"): the real claim(s), in plain English.
- analogy ("The analogy"): one grounded comparison to something familiar.
- practice ("What this means in practice"): concrete implications.
- whyCare ("Why should I care?"): who this actually matters to and why.
- whatTheyBuilt ("What did they actually build?"): only for papers/projects describing something built.
- numbers ("The numbers"): only if the source has real benchmarks/results/metrics worth noting.
- dontBelieve ("Don't accidentally believe the paper"): limitations, caveats, what's being oversold.
- mentalModel ("Mental model"): a durable way to think about this going forward.
- remember ("Remember this"): the one thing worth retaining.
- deeper ("Go deeper"): optional, more technical detail for someone who wants it.`;

const SYSTEM_PROMPT = `You are MakeSense — you explain dense technical material (docs, papers, articles)
in a way a smart, busy person can actually understand and remember.

You will be given selected excerpts from a source document. Base everything on those excerpts.
Every point you make must be tagged with where it comes from:
- "source": directly stated or clearly demonstrated in the excerpts
- "inference": a reasonable conclusion you're drawing, not explicitly stated
- "analogy": a comparison you're making to help understanding — never present an analogy as if it
  came from the source

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "sections": [
    { "id": string, "title": string, "points": [{ "text": string, "evidence": "source" | "inference" | "analogy" }] }
  ]
}

Section ids to choose from (use only ids from this list, skip any that the source doesn't support):
${SECTION_SPEC}

Rules:
- Only include a section if the excerpts genuinely support it. Skip "numbers" if there are no real
  metrics. Skip "whatTheyBuilt" if this isn't describing something built.
- Always include "simple", "actuallySaying", "mentalModel", and "remember" if at all possible.
- Each section: 1-4 points, each point 1-3 sentences.
- For research-paper-like sources, be precise about methodology, benchmarks, and limitations —
  don't repeat impressive numbers without the context needed to judge them.
- Never invent facts not supported by the excerpts. If something is genuinely unclear, say so.`;

function buildUserPrompt(title: string, chunks: DocumentChunk[]): string {
  const excerpts = chunks
    .map((c) => `${c.heading ? `[${c.heading}]\n` : ""}${c.text}`)
    .join("\n\n---\n\n");

  return `Source title: ${title}\n\nSelected excerpts:\n\n${excerpts}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced?.[1]) return JSON.parse(fenced[1].trim());
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("Model response was not valid JSON.");
  }
}

const VALID_EVIDENCE = new Set<EvidenceType>(["source", "inference", "analogy"]);
const VALID_SECTION_IDS = new Set<ExplanationSection["id"]>([
  "simple", "actuallySaying", "analogy", "practice", "whyCare",
  "whatTheyBuilt", "numbers", "dontBelieve", "mentalModel", "remember", "deeper",
]);

function normalizeSections(raw: unknown): ExplanationSection[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const obj = s as Record<string, unknown>;
      const id = VALID_SECTION_IDS.has(obj.id as ExplanationSection["id"])
        ? (obj.id as ExplanationSection["id"])
        : null;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      const pointsRaw = Array.isArray(obj.points) ? obj.points : [];

      const points = pointsRaw
        .map((p) => {
          if (!p || typeof p !== "object") return null;
          const pObj = p as Record<string, unknown>;
          const text = typeof pObj.text === "string" ? pObj.text.trim() : "";
          const evidence = VALID_EVIDENCE.has(pObj.evidence as EvidenceType)
            ? (pObj.evidence as EvidenceType)
            : "inference";
          if (!text) return null;
          return { text, evidence };
        })
        .filter((p): p is { text: string; evidence: EvidenceType } => p !== null);

      if (!id || !title || points.length === 0) return null;
      return { id, title, points };
    })
    .filter((s): s is ExplanationSection => s !== null);
}

export async function explainDocument(
  title: string,
  chunks: DocumentChunk[]
): Promise<DocumentExplanation> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(title, chunks) },
  ];

  try {
    const { text: rawText, provider } = await callAiWithFallback(messages);
    const raw = extractJson(rawText) as Record<string, unknown>;
    const sections = normalizeSections(raw.sections);
    const resolvedTitle = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : title;

    if (sections.length === 0) {
      throw new Error("Model returned no usable sections.");
    }

    return { title: resolvedTitle, sections, provider };
  } catch (err) {
    if (err instanceof MissingApiKeyError || err instanceof AiProviderError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Something went sideways making sense of that.";
    throw new AiProviderError(message);
  }
}
