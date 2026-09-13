import { EvidenceBadge } from "./EvidenceBadge";
import type { ExplanationSection } from "@/types/explanation";

export function Section({ section }: { section: ExplanationSection }) {
  return (
    <div className="space-y-2.5">
      <h3 className="font-display text-lg italic text-[var(--ink)]">{section.title}</h3>
      <ul className="space-y-2">
        {section.points.map((point, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <EvidenceBadge evidence={point.evidence} />
            <span className="text-[15px] leading-relaxed text-[var(--ink)]">{point.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
