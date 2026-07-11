import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../app/router';
import { defaultWorkspacePreferences } from '../modules/settings';

vi.mock('../modules/snippets/api/snippets-api', () => ({
  archiveSnippet: vi.fn(),
  buildPreview: vi.fn(),
  createSnippet: vi.fn(),
  deleteSnippet: vi.fn(),
  duplicateSnippet: vi.fn(),
  exportSnippets: vi.fn(),
  favoriteSnippet: vi.fn(),
  getCategories: vi.fn(),
  getHealth: vi.fn(),
  getSnippet: vi.fn(),
  getSnippets: vi.fn(),
  getTags: vi.fn(),
  importSnippets: vi.fn(),
  searchSnippets: vi.fn(),
  updateSnippet: vi.fn(),
}));

const api = await import('../modules/snippets/api/snippets-api');

const renderRoute = (path: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

describe('app routing integration', () => {
  afterEach(() => {
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
    window.localStorage.setItem('codesnippets:workspace-settings', JSON.stringify(defaultWorkspacePreferences));
  });

  it('renders the workspace route through the shared app shell', async () => {
    renderRoute('/');

    expect(screen.getByRole('navigation', { name: 'Primary workspace' })).toBeInTheDocument();
    expect(await screen.findByText('Library Explorer')).toBeInTheDocument();
  });

  it('renders settings through the same route shell', async () => {
    renderRoute('/settings');

    expect(await screen.findByRole('heading', { name: 'Preferences & Backups' })).toBeInTheDocument();
  });

  it('renders the agent guide route from the shared shell', async () => {
    renderRoute('/agent-guide');

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Personal AI OS Integration Guide' })).toBeInTheDocument());
  });
});
