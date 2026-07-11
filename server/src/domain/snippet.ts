export type SnippetId = string;

export interface Snippet {
  id: SnippetId;
  title: string;
  description: string;
  sourceUrl: string;
  html: string;
  css: string;
  javascript: string;
  tags: string[];
  category: string;
  favorite: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSnippetCommand = {
  title: string;
  description?: string;
  sourceUrl?: string;
  html?: string;
  css?: string;
  javascript?: string;
  tags?: string[];
  category?: string;
};

export type UpdateSnippetCommand = {
  title?: string;
  description?: string;
  sourceUrl?: string;
  html?: string;
  css?: string;
  javascript?: string;
  tags?: string[];
  category?: string;
  favorite?: boolean;
  archived?: boolean;
};

export type SnippetSearchQuery = {
  text?: string;
  tags?: string[];
  category?: string;
  favorite?: boolean;
  archived?: boolean;
  sort?: 'updatedAt' | 'createdAt' | 'title';
  direction?: 'asc' | 'desc';
};

export const normalizeSnippetTags = (tags: string[] = []): string[] => {
  const normalized = tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());

  return Array.from(new Set(normalized)).sort((left, right) => left.localeCompare(right));
};

export const applySnippetUpdate = (snippet: Snippet, command: UpdateSnippetCommand): Snippet => ({
  ...snippet,
  title: command.title ?? snippet.title,
  description: command.description ?? snippet.description,
  sourceUrl: command.sourceUrl?.trim() ?? snippet.sourceUrl,
  html: command.html ?? snippet.html,
  css: command.css ?? snippet.css,
  javascript: command.javascript ?? snippet.javascript,
  tags: command.tags ? normalizeSnippetTags(command.tags) : snippet.tags,
  category: command.category ?? snippet.category,
  favorite: command.favorite !== undefined ? command.favorite : snippet.favorite,
  archived: command.archived !== undefined ? command.archived : snippet.archived,
  updatedAt: new Date(),
});
