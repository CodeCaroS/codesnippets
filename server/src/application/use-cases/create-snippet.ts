import { v4 as uuidv4 } from 'uuid';
import { CreateSnippetCommand, Snippet, normalizeSnippetTags } from '../../domain/snippet.js';
import { SnippetRepository } from '../../domain/snippet-repository.js';

export class CreateSnippetUseCase {
  constructor(private readonly repository: SnippetRepository) {}

  async execute(command: CreateSnippetCommand): Promise<Snippet> {
    const now = new Date();
    const snippet: Snippet = {
      id: uuidv4(),
      title: command.title.trim(),
      description: command.description ?? '',
      html: command.html ?? '',
      css: command.css ?? '',
      javascript: command.javascript ?? '',
      tags: normalizeSnippetTags(command.tags ?? []),
      category: command.category ?? '',
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.save(snippet);
    return snippet;
  }
}
