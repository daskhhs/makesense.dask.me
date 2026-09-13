export function DocumentViewer({
  title,
  sourceLabel,
  chunkCount,
  usedChunks,
}: {
  title: string;
  sourceLabel: string;
  chunkCount: number;
  usedChunks: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs text-[var(--muted)]">
      <span className="truncate">
        {title} <span className="text-[var(--muted)]">— {sourceLabel}</span>
      </span>
      <span className="font-mono">
        {usedChunks}/{chunkCount} sections used
      </span>
    </div>
  );
}
