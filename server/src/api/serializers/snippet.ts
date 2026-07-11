import type { Snippet as SnippetDto } from '@codesnippets/shared';
import type { Snippet } from '../../domain/snippet.js';

export const toSnippetDto = (snippet: Snippet): SnippetDto => ({
  ...snippet,
  createdAt: snippet.createdAt.toISOString(),
  updatedAt: snippet.updatedAt.toISOString(),
});
