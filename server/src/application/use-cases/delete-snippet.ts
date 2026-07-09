import { NotFoundError } from '../errors.js';
import { SnippetId } from '../../domain/snippet.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';

export class DeleteSnippetUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(id: SnippetId): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Snippet not found', { id });
    }
  }
}
