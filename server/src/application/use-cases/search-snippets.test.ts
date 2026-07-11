import { describe, expect, it } from 'vitest';
import { SearchSnippetsUseCase } from './search-snippets.js';
import { InMemorySnippetRepository } from '../../test/in-memory-snippet-repository.js';
import { Snippet } from '../../domain/snippet.js';

const createSnippet = (overrides: Partial<Snippet>): Snippet => ({
  id: crypto.randomUUID(),
  title: 'Snippet',
  description: '',
  sourceUrl: '',
  html: '',
  css: '',
  javascript: '',
  tags: [],
  category: '',
  favorite: false,
  archived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('SearchSnippetsUseCase', () => {
  it('searches snippets by text and tags', async () => {
    const repository = new InMemorySnippetRepository();
    await repository.save(createSnippet({ title: 'React Card', tags: ['react'], category: 'ui' }));
    await repository.save(createSnippet({ title: 'Node API', tags: ['node'], category: 'backend' }));
    const useCase = new SearchSnippetsUseCase(repository);

    const results = await useCase.execute({ text: 'react', tags: ['react'] });

    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe('React Card');
  });

  it('searches snippets by source url text', async () => {
    const repository = new InMemorySnippetRepository();
    await repository.save(
      createSnippet({
        title: 'Inspiration',
        sourceUrl: 'https://inspiration.example/card',
      }),
    );
    const useCase = new SearchSnippetsUseCase(repository);

    const results = await useCase.execute({ text: 'inspiration.example' });

    expect(results).toHaveLength(1);
    expect(results[0]?.sourceUrl).toBe('https://inspiration.example/card');
  });
});
