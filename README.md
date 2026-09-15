# MakeSense

**Give it dense technical stuff. Get the version a human can actually understand.**

Part of the [dask.me](https://dask.me) tool collection.

---

## What it does

Paste a URL, paste raw text, or upload a PDF — a research paper, dense documentation, a technical article — and MakeSense breaks it down into a structured, honest explanation: the stupidly simple version, what's actually being said, a grounded analogy, why it matters in practice, and (for papers) the real numbers with enough context to judge them, plus what's being oversold. Not every section appears for every source — it only includes what the source actually supports.

The distinguishing feature: every single point is tagged **Source** (directly stated in the material), **Inference** (a reasonable conclusion, not explicitly stated), or **Analogy** (a comparison added to aid understanding) — so an analogy never gets quietly presented as if it came from the paper itself.

## How it works

1. **Ingest** — depending on the input type, the source is turned into plain text: HTML is fetched and stripped server-side, a PDF is parsed for its text content, or pasted text is used directly.
2. **Chunk** — the text is split into paragraph-aware chunks, using headings to keep related content grouped rather than cutting mid-thought.
3. **Retrieve** — rather than dumping the entire document into the prompt, chunks are scored with a lightweight lexical relevance model (term-frequency weighted by rarity, i.e. a hand-rolled TF-IDF) against the document as a whole, and only the most substantive chunks are sent to the model. Worth being precise here: this is deterministic lexical retrieval, not neural embeddings — there's no vector-embedding API in this stack yet, but the retrieval layer (`lib/retrieval/search.ts`) is isolated specifically so a real embeddings provider can be dropped in later without touching anything else.
4. **Explain (AI)** — the selected excerpts are sent to an LLM with strict instructions to tag every point by its evidence type and to never invent facts the excerpts don't support.
5. **Render** — sections render in order, with an evidence-mix bar at the top showing, at a glance, how much of the explanation is grounded in the source text versus added as inference or analogy.

## Tech stack

- Next.js (App Router) + TypeScript, Node runtime (for PDF parsing)
- Tailwind CSS
- `pdf-parse` for PDF text extraction
- Custom paragraph-aware chunking and lexical retrieval (`lib/documents/`, `lib/retrieval/`)
- A small provider abstraction (`lib/ai/`) supporting Gemini, Groq, and OpenRouter

## Running locally

```bash
npm install
cp .env.example .env.local
# add at least one API key to .env.local
npm run dev
```

Environment variables (see `.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `AI_PROVIDER` | No | `gemini` \| `groq` \| `openrouter`. Defaults to `gemini`. |
| `GEMINI_API_KEY` | One of these three | |
| `GROQ_API_KEY` | | |
| `OPENROUTER_API_KEY` | | |

## Design notes

An editorial reading theme (Literata for headings, Karla for body, Red Hat Mono for evidence tags) on a warm sage-paper background — built to actually be read start to finish, not skimmed.
