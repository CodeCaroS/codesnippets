import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../errors.js';
import { Snippet, SnippetId } from '../../domain/snippet.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';

const buildCopyTitle = (title: string): string => {
  // Strip any existing " (Copy)" or " (Copy N)" suffix before appending a new one
  const baseTitle = title.replace(/ \(Copy(?: \d+)?\)$/, '').trimEnd();
  return `${baseTitle} (Copy)`;
};

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
      title: buildCopyTitle(existing.title),
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.save(duplicate);
    return duplicate;
  }
}
