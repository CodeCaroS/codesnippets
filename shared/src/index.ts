export interface Snippet {
  id: string;
  title: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  tags: string[];
  category: string;
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnippetRequest {
  title: string;
  description?: string;
  html?: string;
  css?: string;
  javascript?: string;
  tags?: string[];
  category?: string;
}

export interface UpdateSnippetRequest {
  title?: string;
  description?: string;
  html?: string;
  css?: string;
  javascript?: string;
  tags?: string[];
  category?: string;
  favorite?: boolean;
  archived?: boolean;
}

export interface SnippetResponse {
  data: Snippet;
}

export interface SearchSnippetsRequest {
  text?: string;
  tags?: string[];
  category?: string;
  favorite?: boolean;
  archived?: boolean;
  sort?: 'updatedAt' | 'createdAt' | 'title';
  direction?: 'asc' | 'desc';
}

export interface SearchSnippetsResponse {
  data: Snippet[];
  total: number;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportExportData {
  snippets: Snippet[];
  exportedAt: string;
  version: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
  database: 'connected' | 'disconnected';
  timestamp: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  wordWrap: boolean;
  previewLayout: 'split' | 'stacked';
}

export interface Tag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}
