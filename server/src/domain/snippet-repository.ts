import { Snippet, SnippetId, UpdateSnippetCommand, SnippetSearchQuery } from './snippet.js';

export interface SnippetRepository {
  findById(id: SnippetId): Promise<Snippet | null>;
  findAll(query?: SnippetSearchQuery): Promise<Snippet[]>;
  save(snippet: Snippet): Promise<void>;
  update(id: SnippetId, command: UpdateSnippetCommand): Promise<Snippet | null>;
  delete(id: SnippetId): Promise<boolean>;
}
