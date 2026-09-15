"use client";

import { useRef, useState } from "react";
import type { SourceKind } from "@/types/document";

const EXAMPLES = ["Kubernetes", "RAG", "Transformers", "OAuth", "Attention Is All You Need"];

const TABS: { value: SourceKind; label: string }[] = [
  { value: "url", label: "Paste a URL" },
  { value: "text", label: "Paste text" },
  { value: "pdf", label: "Upload PDF" },
];

interface SourceInputProps {
  kind: SourceKind;
  onKindChange: (kind: SourceKind) => void;
  url: string;
  onUrlChange: (v: string) => void;
  text: string;
  onTextChange: (v: string) => void;
  fileName: string | null;
  onFileSelect: (file: File) => void;
  onSubmit: () => void;
  disabled?: boolean;
  canSubmit: boolean;
}

export function SourceInput({
  kind,
  onKindChange,
  url,
  onUrlChange,
  text,
  onTextChange,
  fileName,
  onFileSelect,
  onSubmit,
  disabled,
  canSubmit,
}: SourceInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <section className="space-y-4">
      <div className="inline-flex rounded-md border border-[var(--border)] bg-[var(--surface)] p-0.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            disabled={disabled}
            onClick={() => onKindChange(t.value)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              kind === t.value
                ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {kind === "url" && (
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={disabled}
          placeholder="https://docs.example.com/some-concept"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-mono text-base sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-60"
        />
      )}

      {kind === "text" && (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
          rows={8}
          placeholder="Paste the dense paragraph, abstract, or article text here"
          className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base sm:text-sm leading-relaxed text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-60"
        />
      )}

      {kind === "pdf" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onFileSelect(file);
          }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-md border border-dashed px-4 py-8 text-center text-sm transition ${
            dragOver ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border-strong)]"
          }`}
        >
          <p className="text-[var(--ink)]">
            {fileName ? fileName : "Drop a PDF here, or click to choose one"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Research papers, docs, articles — text-based PDFs</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {kind === "url" &&
            EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                disabled={disabled}
                onClick={() => onUrlChange(`https://en.wikipedia.org/wiki/${ex.replace(/\s+/g, "_")}`)}
                className="rounded border border-[var(--border)] bg-transparent px-2.5 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent-soft)] hover:text-[var(--ink)] disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !canSubmit}
          className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_var(--accent)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          Make sense of it
        </button>
      </div>
    </section>
  );
}
