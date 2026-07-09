import { SnippetRepository } from '../../domain/snippet-repository.js';
import { Snippet, SnippetSearchQuery } from '../../domain/snippet.js';

export class SearchSnippetsUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(query: SnippetSearchQuery): Promise<Snippet[]> {
    return this.repository.search(query);
  }
}
