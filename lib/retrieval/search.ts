import type { DocumentChunk } from "@/types/document";

// Lightweight lexical retrieval: scores chunks by term-frequency overlap against
// the whole-document vocabulary (a simple TF-IDF variant). This keeps the MVP
// dependency-free — swap in a real embeddings provider here later without
// touching the callers, since this function's signature is the retrieval contract.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "is", "are",
  "was", "were", "be", "been", "with", "as", "by", "at", "this", "that", "it", "its",
  "from", "we", "you", "your", "our", "their", "they", "he", "she", "his", "her",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function termFrequencies(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1);
  return map;
}

export function buildDocumentFrequencies(chunks: DocumentChunk[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const chunk of chunks) {
    const seen = new Set(tokenize(chunk.text));
    for (const term of seen) df.set(term, (df.get(term) || 0) + 1);
  }
  return df;
}

export function rankChunks(
  chunks: DocumentChunk[],
  topN: number
): DocumentChunk[] {
  if (chunks.length <= topN) return chunks;

  const df = buildDocumentFrequencies(chunks);
  const totalChunks = chunks.length;

  const scored = chunks.map((chunk) => {
    const tf = termFrequencies(tokenize(chunk.text));
    let score = 0;
    for (const [term, count] of tf) {
      const docFreq = df.get(term) || 1;
      const idf = Math.log(totalChunks / docFreq + 1);
      score += count * idf;
    }
    // Slightly favor chunks with a heading — usually more structurally important.
    if (chunk.heading) score *= 1.15;
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .sort((a, b) => a.chunk.id - b.chunk.id)
    .map((s) => s.chunk);
}
