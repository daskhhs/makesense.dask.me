import type { EvidenceType } from "@/types/explanation";

const CONFIG: Record<EvidenceType, { label: string; fg: string; bg: string; border: string }> = {
  source: { label: "Source", fg: "var(--source)", bg: "var(--source-bg)", border: "var(--source-border)" },
  inference: { label: "Inference", fg: "var(--inference)", bg: "var(--inference-bg)", border: "var(--inference-border)" },
  analogy: { label: "Analogy", fg: "var(--analogy)", bg: "var(--analogy-bg)", border: "var(--analogy-border)" },
};

export function EvidenceBadge({ evidence }: { evidence: EvidenceType }) {
  const c = CONFIG[evidence];
  return (
    <span
      className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ color: c.fg, backgroundColor: c.bg, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
}
