export type EvidenceType = "source" | "inference" | "analogy";

export type ExplainedPoint = {
  text: string;
  evidence: EvidenceType;
};

export type ExplanationSection = {
  id:
    | "simple"
    | "actuallySaying"
    | "analogy"
    | "practice"
    | "whyCare"
    | "whatTheyBuilt"
    | "numbers"
    | "dontBelieve"
    | "mentalModel"
    | "remember"
    | "deeper";
  title: string;
  points: ExplainedPoint[];
};

export type DocumentExplanation = {
  title: string;
  sections: ExplanationSection[];
  provider: string;
};

export type AnalyzeErrorBody = {
  error: string;
  code?: "MISSING_API_KEY" | "EMPTY_INPUT" | "FETCH_FAILED" | "PARSE_FAILED" | "UPSTREAM_ERROR";
};
