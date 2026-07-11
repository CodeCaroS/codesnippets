import { describe, expect, it } from 'vitest';
import { CreateSnippetUseCase } from './create-snippet.js';
import { InMemorySnippetRepository } from '../../test/in-memory-snippet-repository.js';

describe('CreateSnippetUseCase', () => {
  it('creates a snippet with defaults', async () => {
    const repository = new InMemorySnippetRepository();
    const useCase = new CreateSnippetUseCase(repository);

    const snippet = await useCase.execute({ title: 'My Snippet', tags: [' React ', 'react'] });

    expect(snippet.id).toBeTruthy();
    expect(snippet.favorite).toBe(false);
    expect(snippet.archived).toBe(false);
    expect(snippet.sourceUrl).toBe('');
    expect(snippet.tags).toEqual(['react']);
    await expect(repository.findById(snippet.id)).resolves.toEqual(snippet);
  });
});
