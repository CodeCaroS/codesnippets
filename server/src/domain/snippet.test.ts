import { describe, expect, it } from 'vitest';
import { applySnippetUpdate, normalizeSnippetTags, Snippet } from './snippet.js';

const baseSnippet: Snippet = {
  id: 'snippet-1',
  title: 'Hello',
  description: '',
  sourceUrl: '',
  html: '<h1>Hello</h1>',
  css: '',
  javascript: '',
  tags: ['html'],
  category: 'demo',
  favorite: false,
  archived: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('snippet domain helpers', () => {
  it('normalizes snippet tags', () => {
    expect(normalizeSnippetTags([' React ', 'react', 'TypeScript', ''])).toEqual(['react', 'typescript']);
  });

  it('applies snippet updates immutably', () => {
    const updated = applySnippetUpdate(baseSnippet, { title: 'Updated', tags: ['CSS', 'css'] });

    expect(updated).not.toBe(baseSnippet);
    expect(updated.title).toBe('Updated');
    expect(updated.tags).toEqual(['css']);
    expect(baseSnippet.title).toBe('Hello');
  });

  it('allows setting favorite to false via applySnippetUpdate', () => {
    const favorited = applySnippetUpdate(baseSnippet, { favorite: true });
    expect(favorited.favorite).toBe(true);
    const unfavorited = applySnippetUpdate(favorited, { favorite: false });
    expect(unfavorited.favorite).toBe(false);
  });

  it('allows setting archived to false via applySnippetUpdate', () => {
    const archived = applySnippetUpdate(baseSnippet, { archived: true });
    expect(archived.archived).toBe(true);
    const unarchived = applySnippetUpdate(archived, { archived: false });
    expect(unarchived.archived).toBe(false);
  });

  it('updates source urls via applySnippetUpdate', () => {
    const updated = applySnippetUpdate(baseSnippet, { sourceUrl: 'https://example.com/inspiration' });

    expect(updated.sourceUrl).toBe('https://example.com/inspiration');
    expect(baseSnippet.sourceUrl).toBe('');
  });
});
