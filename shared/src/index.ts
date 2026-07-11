export interface Snippet {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
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
  sourceUrl?: string;
  html?: string;
  css?: string;
  javascript?: string;
  tags?: string[];
  category?: string;
}

export interface UpdateSnippetRequest {
  title?: string;
  description?: string;
  sourceUrl?: string;
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

export type PreviewConsoleLevel = 'log' | 'warn' | 'error';

export interface PreviewConsoleMessage {
  source: 'codesnippets-preview';
  type: 'console';
  executionId: string;
  level: PreviewConsoleLevel;
  args: string[];
}

export interface BuildPreviewRequest {
  executionId: string;
  html: string;
  css: string;
  javascript: string;
}

export interface BuildPreviewResponse {
  document: string;
}

const previewConsoleLevels: readonly string[] = ['log', 'warn', 'error'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const isPreviewConsoleMessage = (value: unknown): value is PreviewConsoleMessage => {
  if (!isRecord(value)) {
    return false;
  }

  return value.source === 'codesnippets-preview'
    && value.type === 'console'
    && typeof value.executionId === 'string'
    && typeof value.level === 'string'
    && previewConsoleLevels.includes(value.level)
    && Array.isArray(value.args)
    && value.args.every((argument) => typeof argument === 'string');
};

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

const isIsoDateString = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

export const isSnippet = (value: unknown): value is Snippet => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.description === 'string'
    && typeof value.sourceUrl === 'string'
    && typeof value.html === 'string'
    && typeof value.css === 'string'
    && typeof value.javascript === 'string'
    && isStringArray(value.tags)
    && typeof value.category === 'string'
    && typeof value.favorite === 'boolean'
    && typeof value.archived === 'boolean'
    && isIsoDateString(value.createdAt)
    && isIsoDateString(value.updatedAt);
};

export const isImportExportData = (value: unknown): value is ImportExportData => {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value.snippets)
    && value.snippets.every(isSnippet)
    && isIsoDateString(value.exportedAt)
    && typeof value.version === 'string'
    && value.version.length > 0;
};

export const parseImportExportData = (value: unknown): ImportExportData => {
  if (!isImportExportData(value)) {
    throw new Error('Invalid backup payload');
  }

  return value;
};
