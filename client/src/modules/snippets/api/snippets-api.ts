import type {
  CreateSnippetRequest,
  HealthResponse,
  ImportExportData,
  PaginatedResponse,
  SearchSnippetsRequest,
  SearchSnippetsResponse,
  Snippet,
  SnippetResponse,
  UpdateSnippetRequest,
} from '@codesnippets/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(errorPayload?.error?.message ?? `API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export type SnippetFilters = {
  archived?: boolean;
  favorite?: boolean;
  category?: string;
  tag?: string;
  sort?: 'updatedAt' | 'createdAt' | 'title';
  direction?: 'asc' | 'desc';
};

const toQueryString = (filters: SnippetFilters = {}): string => {
  const params = new URLSearchParams();

  if (filters.archived !== undefined) params.set('archived', String(filters.archived));
  if (filters.favorite !== undefined) params.set('favorite', String(filters.favorite));
  if (filters.category) params.set('category', filters.category);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.direction) params.set('direction', filters.direction);

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const getSnippets = (filters?: SnippetFilters) => request<PaginatedResponse<Snippet>>(`/snippets${toQueryString(filters)}`);
export const getSnippet = async (id: string) => (await request<SnippetResponse>(`/snippets/${id}`)).data;
export const createSnippet = async (data: CreateSnippetRequest) => (await request<SnippetResponse>('/snippets', {
  method: 'POST',
  body: JSON.stringify(data),
})).data;
export const updateSnippet = async (id: string, data: UpdateSnippetRequest) => (await request<SnippetResponse>(`/snippets/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
})).data;
export const deleteSnippet = (id: string) => request<void>(`/snippets/${id}`, { method: 'DELETE' });
export const duplicateSnippet = async (id: string) => (await request<SnippetResponse>(`/snippets/${id}/duplicate`, { method: 'POST' })).data;
export const archiveSnippet = async (id: string) => (await request<SnippetResponse>(`/snippets/${id}/archive`, { method: 'POST' })).data;
export const favoriteSnippet = async (id: string) => (await request<SnippetResponse>(`/snippets/${id}/favorite`, { method: 'POST' })).data;
export const searchSnippets = (query: SearchSnippetsRequest) => request<SearchSnippetsResponse>('/search', {
  method: 'POST',
  body: JSON.stringify(query),
});
export const getHealth = () => request<HealthResponse>('/health');
export const getTags = () => request<{ data: Array<{ id: string; name: string }>; total: number }>('/tags');
export const getCategories = () => request<{ data: Array<{ id: string; name: string }>; total: number }>('/categories');
export const importSnippets = (data: ImportExportData) => request<{ imported: number }>('/import', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const exportSnippets = () => request<ImportExportData>('/export');
export const buildPreview = (html: string, css: string, javascript: string) => request<{ document: string }>('/run', {
  method: 'POST',
  body: JSON.stringify({ html, css, javascript }),
});
