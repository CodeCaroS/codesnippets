import { SnippetRepository } from '../domain/snippet-repository.js';
import { Snippet, SnippetId, SnippetSearchQuery, UpdateSnippetCommand, applySnippetUpdate, normalizeSnippetTags } from '../domain/snippet.js';

export class InMemorySnippetRepository implements SnippetRepository {
  private readonly items = new Map<SnippetId, Snippet>();

  async findById(id: SnippetId): Promise<Snippet | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(query: SnippetSearchQuery = {}): Promise<Snippet[]> {
    return this.filter(query);
  }

  async save(snippet: Snippet): Promise<void> {
    this.items.set(snippet.id, { ...snippet, tags: normalizeSnippetTags(snippet.tags) });
  }

  async update(id: SnippetId, command: UpdateSnippetCommand): Promise<Snippet | null> {
    const snippet = this.items.get(id);

    if (!snippet) {
      return null;
    }

    const updated = applySnippetUpdate(snippet, command);
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: SnippetId): Promise<boolean> {
    return this.items.delete(id);
  }

  async search(query: SnippetSearchQuery): Promise<Snippet[]> {
    return this.filter(query);
  }

  private filter(query: SnippetSearchQuery): Snippet[] {
    return Array.from(this.items.values()).filter((snippet) => {
      const matchesText = query.text
        ? [snippet.title, snippet.description, snippet.html, snippet.css, snippet.javascript]
            .join(' ')
            .toLowerCase()
            .includes(query.text.toLowerCase())
        : true;
      const matchesCategory = query.category ? snippet.category === query.category : true;
      const matchesFavorite = query.favorite !== undefined ? snippet.favorite === query.favorite : true;
      const matchesArchived = query.archived !== undefined ? snippet.archived === query.archived : true;
      const matchesTags = query.tags?.length
        ? query.tags.some((tag) => snippet.tags.includes(tag.toLowerCase()))
        : true;

      return matchesText && matchesCategory && matchesFavorite && matchesArchived && matchesTags;
    });
  }
}
