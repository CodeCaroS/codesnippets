import { describe, expect, it } from 'vitest';
import { applySnippetUpdate, normalizeSnippetTags, Snippet } from './snippet.js';

describe('snippet domain helpers', () => {
  it('normalizes snippet tags', () => {
    expect(normalizeSnippetTags([' React ', 'react', 'TypeScript', ''])).toEqual(['react', 'typescript']);
  });

  it('applies snippet updates immutably', () => {
    const baseSnippet: Snippet = {
      id: 'snippet-1',
      title: 'Hello',
      description: '',
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

    const updated = applySnippetUpdate(baseSnippet, { title: 'Updated', tags: ['CSS', 'css'] });

    expect(updated).not.toBe(baseSnippet);
    expect(updated.title).toBe('Updated');
    expect(updated.tags).toEqual(['css']);
    expect(baseSnippet.title).toBe('Hello');
  });
});
