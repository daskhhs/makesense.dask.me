import type { ExplanationSection } from "@/types/explanation";

export function MentalModel({ section }: { section: ExplanationSection }) {
  return (
    <div className="rounded-md border border-[var(--border-strong)] bg-[var(--surface-raised)] p-4">
      <h3 className="font-display text-lg italic text-[var(--ink)]">{section.title}</h3>
      <ul className="mt-2 space-y-1.5">
        {section.points.map((point, i) => (
          <li key={i} className="text-[15px] leading-relaxed text-[var(--ink)]">
            {point.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
