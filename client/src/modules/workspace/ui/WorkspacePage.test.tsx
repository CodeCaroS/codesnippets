import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Snippet } from '@codesnippets/shared';
import { getTemplateMenuPosition, WorkspacePage } from './WorkspacePage';

vi.mock('../../snippets/api/snippets-api', () => ({
  getSnippets: vi.fn(),
  getCategories: vi.fn(),
  getTags: vi.fn(),
  getSnippet: vi.fn(),
  buildPreview: vi.fn(),
  createSnippet: vi.fn(),
  updateSnippet: vi.fn(),
  favoriteSnippet: vi.fn(),
  archiveSnippet: vi.fn(),
  duplicateSnippet: vi.fn(),
  deleteSnippet: vi.fn(),
}));

const api = await import('../../snippets/api/snippets-api');

const snippet: Snippet = {
  id: 'snippet-1',
  title: 'Reference Card',
  description: 'A copied reference workflow',
  html: '<div>Reference</div>',
  css: '.card { color: red; }',
  javascript: 'console.log("ready")',
  tags: ['ui', 'reference'],
  category: 'Examples',
  favorite: true,
  archived: false,
  createdAt: '2026-07-09T10:00:00.000Z',
  updatedAt: '2026-07-09T11:00:00.000Z',
  sourceUrl: 'https://example.com/inspiration',
};

const secondSnippet: Snippet = {
  ...snippet,
  id: 'snippet-2',
  title: 'Second Card',
  html: '<section>Second</section>',
  css: 'section { color: gold; }',
  javascript: 'console.log("second")',
};

const renderWorkspace = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <WorkspacePage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('WorkspacePage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  beforeEach(() => {
    vi.mocked(api.getSnippets).mockResolvedValue({ data: [snippet], total: 1, page: 1, pageSize: 25 });
    vi.mocked(api.getSnippet).mockResolvedValue(snippet);
    vi.mocked(api.getCategories).mockResolvedValue({ data: [{ id: 'examples', name: 'Examples' }], total: 1 });
    vi.mocked(api.getTags).mockResolvedValue({ data: [{ id: 'ui', name: 'ui' }], total: 1 });
    vi.mocked(api.buildPreview).mockResolvedValue({ document: '<html><body>preview</body></html>' });
    vi.mocked(api.createSnippet).mockResolvedValue(snippet);
    vi.mocked(api.updateSnippet).mockResolvedValue(snippet);
  });

  it('composes the reference workspace surface from modular data APIs', async () => {
    renderWorkspace();

    expect(screen.getByText('Library Explorer')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Reference Card')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'index.html' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'styles.css' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'script.js' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'metadata.json' })).toBeInTheDocument();
    expect(screen.getByText('Sandboxed Viewport')).toBeInTheDocument();
    expect(screen.getByText('Console Logger')).toBeInTheDocument();
  });

  it('creates snippets from rich reference templates', async () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'React 18 + CDN' }));

    expect(screen.getByText('Use Template')).toBeInTheDocument();
    expect(screen.getByDisplayValue('React 18 + CDN')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Workspace Snippet' }));

    await waitFor(() => expect(api.createSnippet).toHaveBeenCalled());
    const payload = vi.mocked(api.createSnippet).mock.calls[0][0];
    expect(payload.title).toBe('React 18 + CDN');
    expect(payload.html).toContain('https://unpkg.com/react@18');
    expect(payload.javascript).toContain('createRoot');
  });

  it('creates reusable custom templates from the current editor state', async () => {
    renderWorkspace();

    await waitFor(() => expect(screen.getByText('Reference Card')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'metadata.json' }));
    await waitFor(() => expect(screen.getByDisplayValue('Reference Card')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Save Current as Template' }));

    expect(screen.getByText('Create Template')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Card Starter' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Template' }));

    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Card Starter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Workspace Snippet' }));

    await waitFor(() => expect(api.createSnippet).toHaveBeenCalled());
    const payload = vi.mocked(api.createSnippet).mock.calls[0][0];
    expect(payload.title).toBe('Card Starter');
    expect(payload.html).toBe(snippet.html);
    expect(window.localStorage.getItem('codesnippets:custom-templates')).toContain('Card Starter');
  });

  it('renders the template dropdown in the workspace overlay layer instead of inside the navigation rail', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));

    const menu = screen.getByRole('menu', { name: 'Snippet templates' });
    expect(menu).toHaveClass('workspace-overlay-menu');
    expect(menu.closest('.icon-rail')).toBeNull();
  });

  it('positions the template dropdown from the trigger instead of covering the icon rail', () => {
    expect(getTemplateMenuPosition({ bottom: 55, left: 174, right: 292 }, 1280)).toEqual({ left: 174, top: 63 });
    expect(getTemplateMenuPosition({ bottom: 55, left: 174, right: 292 }, 360)).toEqual({ left: 68, top: 63 });
  });

  it('runs the preview with the newly selected snippet code instead of stale draft code', async () => {
    vi.mocked(api.getSnippets).mockResolvedValue({ data: [snippet, secondSnippet], total: 2, page: 1, pageSize: 25 });
    vi.mocked(api.getSnippet).mockImplementation(async (id: string) => (id === secondSnippet.id ? secondSnippet : snippet));

    renderWorkspace();

    await waitFor(() => expect(screen.getByText('Reference Card')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Second Card'));

    await waitFor(() => expect(api.buildPreview).toHaveBeenCalled());
    expect(vi.mocked(api.buildPreview).mock.calls.at(-1)?.[0]).toMatchObject({
      html: secondSnippet.html,
      css: secondSnippet.css,
      javascript: secondSnippet.javascript,
    });
  });

  it('marks code tabs as full-height editor surfaces and metadata as compact form surface', async () => {
    renderWorkspace();

    await waitFor(() => expect(screen.getByText('Reference Card')).toBeInTheDocument());
    expect(document.querySelector('.workspace-editor__body')).toHaveClass('workspace-editor__body--code');

    fireEvent.click(screen.getByRole('button', { name: 'metadata.json' }));

    expect(document.querySelector('.workspace-editor__body')).toHaveClass('workspace-editor__body--metadata');
    expect(document.querySelector('.metadata-editor')).toHaveClass('metadata-editor--compact');
    await waitFor(() => expect(screen.getByLabelText('Source / Inspiration URL')).toHaveValue('https://example.com/inspiration'));

    fireEvent.change(screen.getByLabelText('Source / Inspiration URL'), {
      target: { value: 'https://example.com/source' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.updateSnippet).toHaveBeenCalled());
    expect(vi.mocked(api.updateSnippet).mock.calls.at(-1)?.[1]).toMatchObject({
      sourceUrl: 'https://example.com/source',
    });
  });
});
