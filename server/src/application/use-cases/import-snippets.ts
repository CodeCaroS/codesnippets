import type { ImportExportData } from '@codesnippets/shared';
import { SnippetRepository } from '../../domain/snippet-repository.js';
import { Snippet, normalizeSnippetTags } from '../../domain/snippet.js';

export class ImportSnippetsUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(data: ImportExportData): Promise<{ imported: number }> {
    for (const snippet of data.snippets) {
      const entity: Snippet = {
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        sourceUrl: snippet.sourceUrl?.trim() ?? '',
        html: snippet.html,
        css: snippet.css,
        javascript: snippet.javascript,
        tags: normalizeSnippetTags(snippet.tags),
        category: snippet.category,
        favorite: snippet.favorite,
        archived: snippet.archived,
        createdAt: new Date(snippet.createdAt),
        updatedAt: new Date(snippet.updatedAt),
      };

      await this.repository.save(entity);
    }

    return { imported: data.snippets.length };
  }
}
