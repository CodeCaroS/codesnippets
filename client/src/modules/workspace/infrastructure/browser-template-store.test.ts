import { beforeEach, describe, expect, it } from 'vitest';
import { loadCustomTemplates } from './browser-template-store';

describe('browser template store', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads only valid persisted templates', () => {
    window.localStorage.setItem('codesnippets:custom-templates', JSON.stringify([
      {
        id: 'template-1',
        name: 'Valid',
        title: 'Valid',
        category: 'Examples',
        description: '',
        tags: ['demo'],
        html: '<main />',
        css: '',
        javascript: '',
      },
      { id: 'bad-template' },
    ]));

    expect(loadCustomTemplates()).toEqual([
      {
        id: 'template-1',
        name: 'Valid',
        title: 'Valid',
        category: 'Examples',
        description: '',
        tags: ['demo'],
        html: '<main />',
        css: '',
        javascript: '',
      },
    ]);
  });
});
