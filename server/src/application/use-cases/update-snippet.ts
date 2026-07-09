import { NotFoundError } from '../errors.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';
import { Snippet, SnippetId, UpdateSnippetCommand } from '../../domain/snippet.js';

export class UpdateSnippetUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(id: SnippetId, command: UpdateSnippetCommand): Promise<Snippet> {
    const snippet = await this.repository.update(id, command);

    if (!snippet) {
      throw new NotFoundError('Snippet not found', { id });
    }

    return snippet;
  }
}
