import type { DocumentExplanation } from "@/types/explanation";

export function Diagram({ explanation }: { explanation: DocumentExplanation }) {
  const counts = { source: 0, inference: 0, analogy: 0 };
  for (const section of explanation.sections) {
    for (const point of section.points) {
      counts[point.evidence]++;
    }
  }
  const total = counts.source + counts.inference + counts.analogy || 1;

  const bars = [
    { key: "source", label: "Source", value: counts.source, color: "var(--source)" },
    { key: "inference", label: "Inference", value: counts.inference, color: "var(--inference)" },
    { key: "analogy", label: "Analogy", value: counts.analogy, color: "var(--analogy)" },
  ] as const;

  return (
    <div className="space-y-2 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Where this explanation comes from
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]">
        {bars.map((b) => (
          <div
            key={b.key}
            style={{ width: `${(b.value / total) * 100}%`, backgroundColor: b.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
        {bars.map((b) => (
          <span key={b.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} aria-hidden />
            {b.label} ({b.value})
          </span>
        ))}
      </div>
    </div>
  );
}
