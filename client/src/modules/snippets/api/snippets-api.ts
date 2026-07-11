import type {
  BuildPreviewRequest,
  BuildPreviewResponse,
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
import { isImportExportData, isSnippet } from '@codesnippets/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isSnippetResponse = (value: unknown): value is SnippetResponse => isRecord(value) && isSnippet(value.data);

const isPaginatedSnippetResponse = (value: unknown): value is PaginatedResponse<Snippet> => {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return false;
  }

  return value.data.every(isSnippet)
    && typeof value.total === 'number'
    && Number.isInteger(value.total)
    && typeof value.page === 'number'
    && Number.isInteger(value.page)
    && typeof value.pageSize === 'number'
    && Number.isInteger(value.pageSize);
};

const isSearchSnippetsResponse = (value: unknown): value is SearchSnippetsResponse => {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return false;
  }

  return value.data.every(isSnippet) && typeof value.total === 'number' && Number.isInteger(value.total);
};

const isHealthResponse = (value: unknown): value is HealthResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return (value.status === 'ok' || value.status === 'degraded')
    && typeof value.version === 'string'
    && (value.database === 'connected' || value.database === 'disconnected')
    && typeof value.timestamp === 'string';
};

const isNamedCollectionResponse = (value: unknown): value is { data: Array<{ id: string; name: string }>; total: number } => {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return false;
  }

  return value.data.every((item) => isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string')
    && typeof value.total === 'number'
    && Number.isInteger(value.total);
};

const isImportCountResponse = (value: unknown): value is { imported: number } => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.imported === 'number' && Number.isInteger(value.imported);
};

const isBuildPreviewResponse = (value: unknown): value is BuildPreviewResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.document === 'string';
};

const request = async <T>(
  path: string,
  init?: RequestInit,
  validator?: (value: unknown) => value is T,
): Promise<T> => {
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

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`API response for ${path} was not valid JSON`);
  }

  if (validator && !validator(payload)) {
    throw new Error(`API response for ${path} had an unexpected shape`);
  }

  return payload as T;
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

export const getSnippets = (filters?: SnippetFilters) =>
  request<PaginatedResponse<Snippet>>(`/snippets${toQueryString(filters)}`, undefined, isPaginatedSnippetResponse);

export const getSnippet = async (id: string) =>
  (await request<SnippetResponse>(`/snippets/${id}`, undefined, isSnippetResponse)).data;

export const createSnippet = async (data: CreateSnippetRequest) =>
  (await request<SnippetResponse>('/snippets', {
    method: 'POST',
    body: JSON.stringify(data),
  }, isSnippetResponse)).data;

export const updateSnippet = async (id: string, data: UpdateSnippetRequest) =>
  (await request<SnippetResponse>(`/snippets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, isSnippetResponse)).data;

export const deleteSnippet = (id: string) => request<void>(`/snippets/${id}`, { method: 'DELETE' });

export const duplicateSnippet = async (id: string) =>
  (await request<SnippetResponse>(`/snippets/${id}/duplicate`, { method: 'POST' }, isSnippetResponse)).data;

export const archiveSnippet = async (id: string) =>
  (await request<SnippetResponse>(`/snippets/${id}/archive`, { method: 'POST' }, isSnippetResponse)).data;

export const favoriteSnippet = async (id: string) =>
  (await request<SnippetResponse>(`/snippets/${id}/favorite`, { method: 'POST' }, isSnippetResponse)).data;

export const searchSnippets = (query: SearchSnippetsRequest) =>
  request<SearchSnippetsResponse>('/search', {
    method: 'POST',
    body: JSON.stringify(query),
  }, isSearchSnippetsResponse);

export const getHealth = () => request<HealthResponse>('/health', undefined, isHealthResponse);

export const getTags = () =>
  request<{ data: Array<{ id: string; name: string }>; total: number }>('/tags', undefined, isNamedCollectionResponse);

export const getCategories = () =>
  request<{ data: Array<{ id: string; name: string }>; total: number }>('/categories', undefined, isNamedCollectionResponse);

export const importSnippets = (data: ImportExportData) =>
  request<{ imported: number }>('/import', {
    method: 'POST',
    body: JSON.stringify(data),
  }, isImportCountResponse);

export const exportSnippets = () => request<ImportExportData>('/export', undefined, isImportExportData);

export const buildPreview = (input: BuildPreviewRequest, signal?: AbortSignal) =>
  request<BuildPreviewResponse>('/run', {
    method: 'POST',
    body: JSON.stringify(input),
    signal,
  }, isBuildPreviewResponse);
