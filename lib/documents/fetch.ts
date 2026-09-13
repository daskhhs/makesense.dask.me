const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /\.local$/i,
  /^169\.254\./,
];

export class InvalidUrlError extends Error {}
export class FetchFailedError extends Error {}

export function normalizeUrl(input: string): URL {
  let candidate = input.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new InvalidUrlError("That doesn't look like a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidUrlError("Only http and https URLs are supported.");
  }

  if (PRIVATE_HOST_PATTERNS.some((p) => p.test(url.hostname))) {
    throw new InvalidUrlError("Can't fetch local or private addresses.");
  }

  return url;
}

export async function fetchUrlHtml(url: URL): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MakeSenseBot/1.0; +https://makesense.dask.me)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      throw new FetchFailedError(`Source responded with ${res.status}.`);
    }

    const html = await res.text();
    return { html: html.slice(0, 800_000), finalUrl: res.url };
  } catch (err) {
    if (err instanceof FetchFailedError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new FetchFailedError("The source took too long to respond.");
    }
    throw new FetchFailedError(err instanceof Error ? err.message : "Could not reach that source.");
  } finally {
    clearTimeout(timeout);
  }
}
