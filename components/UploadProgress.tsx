interface UploadProgressProps {
  phase: "reading" | "uploading" | "processing";
  progress: number;
  fileName?: string;
}

const PHASE_LABEL: Record<UploadProgressProps["phase"], string> = {
  reading: "Reading the file…",
  uploading: "Uploading…",
  processing: "Breaking it into useful pieces…",
};

export function UploadProgress({ phase, progress, fileName }: UploadProgressProps) {
  const pct = Math.round(progress * 100);
  const determinate = phase === "uploading";

  return (
    <div className="animate-fade-in-up space-y-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-[var(--ink)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
          {PHASE_LABEL[phase]}
        </span>
        {fileName && <span className="truncate font-mono text-xs text-[var(--muted)]">{fileName}</span>}
        {determinate && <span className="font-mono text-xs text-[var(--muted)]">{pct}%</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-raised)]">
        <div
          className={`h-full rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out ${
            determinate ? "" : "animate-[indeterminate_1.3s_ease-in-out_infinite]"
          }`}
          style={determinate ? { width: `${pct}%` } : { width: "40%" }}
        />
      </div>
    </div>
  );
}
