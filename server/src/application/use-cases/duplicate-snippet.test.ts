import { describe, expect, it } from 'vitest';
import { CreateSnippetUseCase } from './create-snippet.js';
import { DuplicateSnippetUseCase } from './duplicate-snippet.js';
import { InMemorySnippetRepository } from '../../test/in-memory-snippet-repository.js';

describe('DuplicateSnippetUseCase', () => {
  it('duplicates a snippet and appends (Copy) to the title', async () => {
    const repository = new InMemorySnippetRepository();
    const createUseCase = new CreateSnippetUseCase(repository);
    const duplicateUseCase = new DuplicateSnippetUseCase(repository);

    const original = await createUseCase.execute({ title: 'My Snippet' });
    const copy = await duplicateUseCase.execute(original.id);

    expect(copy.id).not.toBe(original.id);
    expect(copy.title).toBe('My Snippet (Copy)');
    expect(copy.favorite).toBe(false);
    expect(copy.archived).toBe(false);
  });

  it('does not stack (Copy) when duplicating a copy', async () => {
    const repository = new InMemorySnippetRepository();
    const createUseCase = new CreateSnippetUseCase(repository);
    const duplicateUseCase = new DuplicateSnippetUseCase(repository);

    const original = await createUseCase.execute({ title: 'My Snippet' });
    const copy = await duplicateUseCase.execute(original.id);
    const copyOfCopy = await duplicateUseCase.execute(copy.id);

    expect(copyOfCopy.title).toBe('My Snippet (Copy)');
  });
});
