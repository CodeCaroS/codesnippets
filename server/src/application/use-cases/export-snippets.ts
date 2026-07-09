import type { ImportExportData } from '@codesnippets/shared';
import { SnippetRepository } from '../../domain/snippet-repository.js';

export class ExportSnippetsUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(): Promise<ImportExportData> {
    const snippets = await this.repository.findAll({ sort: 'updatedAt', direction: 'desc' });

    return {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      snippets: snippets.map((snippet) => ({
        ...snippet,
        createdAt: snippet.createdAt.toISOString(),
        updatedAt: snippet.updatedAt.toISOString(),
      })),
    };
  }
}
