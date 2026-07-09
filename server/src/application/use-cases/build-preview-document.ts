import { buildPreviewDocument } from '../../infrastructure/preview/preview-builder.js';

export type BuildPreviewCommand = {
  html?: string;
  css?: string;
  javascript?: string;
};

export class BuildPreviewDocumentUseCase {
  execute(command: BuildPreviewCommand): { document: string } {
    return {
      document: buildPreviewDocument(command),
    };
  }
}
