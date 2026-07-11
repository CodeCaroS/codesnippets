import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
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

describe('SettingsPage', () => {
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

  it('renders the minimal settings layout with preferences, status, and backup panels', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Preferences & Backups' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Editor preferences' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Database status' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Backup tools' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save preferences' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download database JSON' })).toBeInTheDocument();
  });

  it('keeps the status snapshot and backup import controls visible', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>,
    );

    const snapshot = screen.getByLabelText('Workspace snapshot');
    expect(snapshot).toHaveTextContent('Backend');
    expect(snapshot).toHaveTextContent('Snippets');
    expect(snapshot).toHaveTextContent('Tags');
    expect(screen.getByLabelText('Editor Font Size (px)')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-save interval')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('{ "snippets": [ ... ], "exportedAt": "...", "version": "..." }')).toBeInTheDocument();
  });
});
