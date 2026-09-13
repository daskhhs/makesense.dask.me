import type { DocumentChunk } from "@/types/document";

const TARGET_CHUNK_SIZE = 900;
const HEADING_LIKE = /^(#{1,4}\s+.+|[A-Z][A-Za-z0-9 ,'-]{3,80})$/;

export function chunkText(text: string): DocumentChunk[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: DocumentChunk[] = [];
  let current = "";
  let currentHeading: string | undefined;
  let id = 0;

  const flush = () => {
    if (current.trim().length === 0) return;
    chunks.push({ id: id++, heading: currentHeading, text: current.trim() });
    current = "";
  };

  for (const para of paragraphs) {
    const isShortLine = para.length < 90 && !para.includes(". ");
    if (isShortLine && HEADING_LIKE.test(para)) {
      flush();
      currentHeading = para.replace(/^#{1,4}\s+/, "");
      continue;
    }

    if (current.length + para.length > TARGET_CHUNK_SIZE && current.length > 0) {
      flush();
    }
    current += (current ? "\n\n" : "") + para;
  }
  flush();

  return chunks.length > 0 ? chunks : [{ id: 0, text: text.slice(0, TARGET_CHUNK_SIZE) }];
}
