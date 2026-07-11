import type { SnippetTemplate } from '../domain/workspace-editor';
import { loadFromStorage, saveToStorage } from '../../../shared/infrastructure/browser-storage';

const customTemplatesKey = 'codesnippets:custom-templates';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toSnippetTemplate = (value: unknown): SnippetTemplate | null => {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.name !== 'string'
    || typeof value.title !== 'string'
    || typeof value.category !== 'string'
    || typeof value.description !== 'string'
    || typeof value.html !== 'string'
    || typeof value.css !== 'string'
    || typeof value.javascript !== 'string'
    || !Array.isArray(value.tags)
    || !value.tags.every((tag) => typeof tag === 'string')
    || (value.sourceUrl !== undefined && typeof value.sourceUrl !== 'string')) {
    return null;
  }

  const template = {
    id: value.id,
    name: value.name,
    title: value.title,
    category: value.category,
    description: value.description,
    tags: value.tags,
    html: value.html,
    css: value.css,
    javascript: value.javascript,
  };
  return typeof value.sourceUrl === 'string' ? { ...template, sourceUrl: value.sourceUrl } : template;
};

export const loadCustomTemplates = (): SnippetTemplate[] => {
  return loadFromStorage(customTemplatesKey, (value: unknown) => Array.isArray(value)
      ? value.flatMap((value) => {
          const template = toSnippetTemplate(value);
          return template ? [template] : [];
        })
      : [], []);
};

export const saveCustomTemplates = (templates: SnippetTemplate[]): void => {
  saveToStorage(customTemplatesKey, templates);
};
