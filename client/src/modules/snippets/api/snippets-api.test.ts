import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportSnippets, getSnippets } from './snippets-api';

const response = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('snippets api validation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects malformed snippet list responses', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ data: [{ id: 'broken' }], total: 1, page: 1, pageSize: 25 }) as never);

    await expect(getSnippets()).rejects.toThrow('unexpected shape');
  });

  it('rejects malformed export payloads', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ snippets: [], exportedAt: 'not-a-date', version: '0.1.0' }) as never);

    await expect(exportSnippets()).rejects.toThrow('unexpected shape');
  });
});
