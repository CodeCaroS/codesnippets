import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

vi.mock('../../snippets/api/snippets-api', () => ({
  exportSnippets: vi.fn(),
  getCategories: vi.fn(),
  getHealth: vi.fn(),
  getSnippets: vi.fn(),
  getTags: vi.fn(),
  importSnippets: vi.fn(),
}));

const api = await import('../../snippets/api/snippets-api');

describe('SettingsPage import flow', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(api.getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
      version: '0.1.0',
      timestamp: '2026-07-09T10:00:00.000Z',
    });
    vi.mocked(api.getSnippets).mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25 });
    vi.mocked(api.getCategories).mockResolvedValue({ data: [], total: 0 });
    vi.mocked(api.getTags).mockResolvedValue({ data: [], total: 0 });
  });

  it('rejects malformed backup payloads before calling the import API', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole('region', { name: 'Backup tools' })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Paste backup JSON'), {
      target: { value: '{"snippets":[],"exportedAt":"2026-07-09T10:00:00.000Z"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load backup' }));

    expect(await screen.findByText('Invalid backup payload. Check the snippet export JSON structure.')).toBeInTheDocument();
    expect(api.importSnippets).not.toHaveBeenCalled();
  });
});
