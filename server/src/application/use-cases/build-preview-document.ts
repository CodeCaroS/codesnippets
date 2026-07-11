import type { PreviewDocumentBuilder, PreviewDocumentInput } from '../ports/preview-document-builder.js';

export type BuildPreviewCommand = PreviewDocumentInput;

export class BuildPreviewDocumentUseCase {
  constructor(private readonly previewDocumentBuilder: PreviewDocumentBuilder) {}

  execute(command: BuildPreviewCommand): { document: string } {
    return {
      document: this.previewDocumentBuilder.build(command),
    };
  }
}
