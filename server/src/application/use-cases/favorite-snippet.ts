import { NotFoundError } from '../errors.js';
import { Snippet, SnippetId } from '../../domain/snippet.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';

export class FavoriteSnippetUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(id: SnippetId): Promise<Snippet> {
    const snippet = await this.repository.findById(id);

    if (!snippet) {
      throw new NotFoundError('Snippet not found', { id });
    }

    const updated = await this.repository.update(id, { favorite: !snippet.favorite });

    if (!updated) {
      throw new NotFoundError('Snippet not found', { id });
    }

    return updated;
  }
}
