export type PreviewDocumentInput = {
  readonly executionId: string;
  readonly html: string;
  readonly css: string;
  readonly javascript: string;
};

export interface PreviewDocumentBuilder {
  build(input: PreviewDocumentInput): string;
}
