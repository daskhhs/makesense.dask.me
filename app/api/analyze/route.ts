import { NextResponse } from "next/server";
import { normalizeUrl, fetchUrlHtml, FetchFailedError } from "@/lib/documents/fetch";
import { extractTitleFromHtml, htmlToPlainText, pdfToPlainText, ParseFailedError } from "@/lib/documents/parse";
import { chunkText } from "@/lib/documents/chunk";
import { rankChunks } from "@/lib/retrieval/search";
import { explainDocument, MissingApiKeyError, AiProviderError } from "@/lib/explanation";
import type { SourceKind } from "@/types/document";

const MAX_CHUNKS_FOR_MODEL = 14;

type RequestBody = {
  kind?: unknown;
  url?: unknown;
  text?: unknown;
  pdfBase64?: unknown;
  filename?: unknown;
};

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const kind = body.kind as SourceKind;
  let title = "";
  let plainText = "";
  let sourceLabel = "";

  try {
    if (kind === "url") {
      if (typeof body.url !== "string" || !body.url.trim()) {
        return NextResponse.json({ error: "Paste a URL first.", code: "EMPTY_INPUT" }, { status: 400 });
      }
      const url = normalizeUrl(body.url);
      const { html, finalUrl } = await fetchUrlHtml(url);
      title = extractTitleFromHtml(html);
      plainText = htmlToPlainText(html);
      sourceLabel = finalUrl;
    } else if (kind === "pdf") {
      if (typeof body.pdfBase64 !== "string" || !body.pdfBase64.trim()) {
        return NextResponse.json({ error: "Upload a PDF first.", code: "EMPTY_INPUT" }, { status: 400 });
      }
      const { text } = await pdfToPlainText(body.pdfBase64);
      plainText = text;
      title = typeof body.filename === "string" && body.filename.trim() ? body.filename.trim() : "Uploaded PDF";
      sourceLabel = title;
    } else {
      if (typeof body.text !== "string" || !body.text.trim()) {
        return NextResponse.json({ error: "Paste some text first.", code: "EMPTY_INPUT" }, { status: 400 });
      }
      plainText = body.text.trim();
      title = "Pasted text";
      sourceLabel = "Pasted text";
    }
  } catch (err) {
    if (err instanceof FetchFailedError) {
      return NextResponse.json({ error: err.message, code: "FETCH_FAILED" }, { status: 502 });
    }
    if (err instanceof ParseFailedError) {
      return NextResponse.json({ error: err.message, code: "PARSE_FAILED" }, { status: 422 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid input.", code: "EMPTY_INPUT" },
      { status: 400 }
    );
  }

  if (!plainText || plainText.trim().length < 40) {
    return NextResponse.json(
      { error: "Couldn't find enough readable text in that source.", code: "PARSE_FAILED" },
      { status: 422 }
    );
  }

  const allChunks = chunkText(plainText);
  const selectedChunks = rankChunks(allChunks, MAX_CHUNKS_FOR_MODEL);

  try {
    const explanation = await explainDocument(title, selectedChunks);
    return NextResponse.json({
      title,
      sourceLabel,
      sourceKind: kind,
      chunkCount: allChunks.length,
      usedChunks: selectedChunks.length,
      explanation,
    });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: err.message, code: "MISSING_API_KEY" }, { status: 503 });
    }
    if (err instanceof AiProviderError) {
      return NextResponse.json({ error: err.message, code: "UPSTREAM_ERROR" }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Couldn't make sense of that source.", code: "UPSTREAM_ERROR" },
      { status: 500 }
    );
  }
}
