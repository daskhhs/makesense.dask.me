export class ParseFailedError extends Error {}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractTitleFromHtml(html: string): string {
  const ogTitle = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  if (ogTitle?.[1]) return ogTitle[1].trim();
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleTag ? stripTags(titleTag[1]).trim().slice(0, 200) : "Untitled document";
}

export function htmlToPlainText(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const text = stripTags(bodyMatch?.[1] || html);
  return text.slice(0, 60_000);
}

export async function pdfToPlainText(base64Data: string): Promise<{ text: string; pageCount: number }> {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    // Import the internal module directly, not the package's index.js — the
    // index.js has a "debug mode" side effect keyed on `!module.parent` that
    // misfires under Next.js bundling and tries to read a test fixture file.
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const result = await pdfParse(buffer);
    return { text: result.text.slice(0, 60_000), pageCount: result.numpages };
  } catch (err) {
    throw new ParseFailedError(
      err instanceof Error ? `Couldn't read that PDF: ${err.message}` : "Couldn't read that PDF."
    );
  }
}
