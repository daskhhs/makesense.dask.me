"use client";

import { useCallback, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SourceInput } from "@/components/SourceInput";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Explanation } from "@/components/Explanation";
import { UploadProgress } from "@/components/UploadProgress";
import { postJsonWithProgress } from "@/lib/xhr-upload";
import type { SourceKind } from "@/types/document";
import type { AnalyzeErrorBody, DocumentExplanation } from "@/types/explanation";

type Status = "idle" | "reading" | "uploading" | "processing" | "loading" | "error" | "missing-key" | "result";

type AnalyzeResult = {
  title: string;
  sourceLabel: string;
  chunkCount: number;
  usedChunks: number;
  explanation: DocumentExplanation;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [kind, setKind] = useState<SourceKind>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const canSubmit =
    (kind === "url" && url.trim().length > 0) ||
    (kind === "text" && text.trim().length > 0) ||
    (kind === "pdf" && file !== null);

  const isBusy = status === "reading" || status === "uploading" || status === "processing" || status === "loading";

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setMessage(null);
    setResult(null);

    try {
      if (kind === "pdf" && file) {
        setStatus("reading");
        setUploadProgress(0);
        const pdfBase64 = await fileToBase64(file);

        setStatus("uploading");
        const res = await postJsonWithProgress<AnalyzeResult | AnalyzeErrorBody>(
          "/api/analyze",
          { kind, pdfBase64, filename: file.name },
          (fraction) => {
            setUploadProgress(fraction);
            if (fraction >= 1) setStatus("processing");
          }
        );

        if (!res.ok) {
          const body = res.data as AnalyzeErrorBody;
          setMessage(body.error);
          setStatus(body.code === "MISSING_API_KEY" ? "missing-key" : "error");
          return;
        }

        setResult(res.data as AnalyzeResult);
        setStatus("result");
        return;
      }

      setStatus("loading");
      const payload = kind === "url" ? { kind, url: url.trim() } : { kind, text: text.trim() };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json()) as AnalyzeErrorBody;
        setMessage(body.error);
        setStatus(body.code === "MISSING_API_KEY" ? "missing-key" : "error");
        return;
      }

      const body = (await res.json()) as AnalyzeResult;
      setResult(body);
      setStatus("result");
    } catch {
      setMessage("Network error — could not reach the analyze API.");
      setStatus("error");
    }
  }, [kind, url, text, file, canSubmit]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--bg)] text-[var(--ink)]">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
        <p className="max-w-xl text-[var(--muted)]">
          Give it dense technical stuff and get the version a human can actually understand.
        </p>

        <SourceInput
          kind={kind}
          onKindChange={(k) => {
            setKind(k);
            if (status === "error") {
              setStatus("idle");
              setMessage(null);
            }
          }}
          url={url}
          onUrlChange={setUrl}
          text={text}
          onTextChange={setText}
          fileName={file?.name ?? null}
          onFileSelect={setFile}
          onSubmit={handleSubmit}
          disabled={isBusy}
          canSubmit={canSubmit}
        />

        {(status === "reading" || status === "uploading" || status === "processing") && (
          <UploadProgress
            phase={status}
            progress={status === "uploading" ? uploadProgress : status === "processing" ? 1 : 0}
            fileName={file?.name}
          />
        )}

        {status === "loading" && (
          <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
            Reading the source and breaking it into useful pieces…
          </div>
        )}

        {status === "error" && message && (
          <div className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-sm text-[var(--danger)]" role="alert">
            {message}
          </div>
        )}

        {status === "missing-key" && message && (
          <div className="rounded-md border border-[var(--warn-border)] bg-[var(--warn-bg)] px-3 py-2.5 text-sm text-[var(--warn)]" role="status">
            {message}
          </div>
        )}

        {status === "result" && result && (
          <div className="animate-fade-in-up space-y-6 border-t border-[var(--border)] pt-8">
            <h2 className="font-display text-2xl italic text-[var(--ink)]">{result.explanation.title}</h2>
            <DocumentViewer
              title={result.title}
              sourceLabel={result.sourceLabel}
              chunkCount={result.chunkCount}
              usedChunks={result.usedChunks}
            />
            <Explanation explanation={result.explanation} />
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        {result ? `Explained via ${result.explanation.provider}` : "The friend you wish the documentation had."}
      </footer>
    </div>
  );
}
