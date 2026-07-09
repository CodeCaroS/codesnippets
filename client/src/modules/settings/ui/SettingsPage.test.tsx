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

  it('combines reference-style preferences, database status, and backup tools', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('System Preferences & Tools')).toBeInTheDocument();
    expect(screen.getByLabelText('Editor Font Size (px)')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-save interval')).toBeInTheDocument();
    expect(await screen.findByText('Local Database Status')).toBeInTheDocument();
    expect(screen.getByText('Backup Library Engine')).toBeInTheDocument();
  });

  it('uses ordered settings sections instead of an unstructured tools layout', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>,
    );

    expect(document.querySelector('.settings-tools-grid')).toHaveClass('settings-tools-grid--ordered');
    expect(await screen.findByRole('region', { name: 'Editor preferences' })).toHaveClass('settings-section--preferences');
    expect(screen.getByRole('region', { name: 'Database status' })).toHaveClass('settings-section--status');
    expect(screen.getByRole('region', { name: 'Backup tools' })).toHaveClass('settings-section--backup');
  });
});
