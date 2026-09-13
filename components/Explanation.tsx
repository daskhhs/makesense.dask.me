import { Section } from "./Section";
import { MentalModel } from "./MentalModel";
import { Diagram } from "./Diagram";
import type { DocumentExplanation } from "@/types/explanation";

export function Explanation({ explanation }: { explanation: DocumentExplanation }) {
  const mentalModelSection = explanation.sections.find((s) => s.id === "mentalModel");
  const otherSections = explanation.sections.filter((s) => s.id !== "mentalModel");

  return (
    <div className="space-y-8">
      <Diagram explanation={explanation} />
      <div className="space-y-7">
        {otherSections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
      {mentalModelSection && <MentalModel section={mentalModelSection} />}
    </div>
  );
}
