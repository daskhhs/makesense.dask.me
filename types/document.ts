export type SourceKind = "url" | "text" | "pdf";

export type DocumentChunk = {
  id: number;
  heading?: string;
  text: string;
};

export type ParsedDocument = {
  title: string;
  sourceKind: SourceKind;
  sourceLabel: string;
  chunks: DocumentChunk[];
  fullTextLength: number;
};
