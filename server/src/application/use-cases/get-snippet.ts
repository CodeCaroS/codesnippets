import { NotFoundError } from '../errors.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';
import { Snippet, SnippetId } from '../../domain/snippet.js';

export class GetSnippetUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(id: SnippetId): Promise<Snippet> {
    const snippet = await this.repository.findById(id);

    if (!snippet) {
      throw new NotFoundError('Snippet not found', { id });
    }

    return snippet;
  }
}
