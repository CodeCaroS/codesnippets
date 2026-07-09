import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../errors.js';
import { Snippet, SnippetId } from '../../domain/snippet.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';

export class DuplicateSnippetUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(id: SnippetId): Promise<Snippet> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundError('Snippet not found', { id });
    }

    const now = new Date();
    const duplicate: Snippet = {
      ...existing,
      id: uuidv4(),
      title: `${existing.title} (Copy)`,
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.save(duplicate);
    return duplicate;
  }
}
