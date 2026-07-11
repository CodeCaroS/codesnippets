import type { CreateSnippetRequest, Snippet } from '@codesnippets/shared';

export type EditorState = Pick<
  Snippet,
  'title' | 'description' | 'sourceUrl' | 'html' | 'css' | 'javascript' | 'tags' | 'category' | 'favorite'
>;

export type SnippetTemplate = CreateSnippetRequest & {
  id: string;
  name: string;
};

export const emptyEditorState: EditorState = {
  title: 'Untitled snippet',
  description: '',
  sourceUrl: '',
  html: '<div class="app">Hello CodeSnippets</div>',
  css: '.app { font-family: sans-serif; padding: 1rem; }',
  javascript: 'console.log("Ready")',
  tags: ['demo'],
  category: 'Examples',
  favorite: false,
};

export const toEditorState = (snippet: Snippet): EditorState => ({
  title: snippet.title,
  description: snippet.description,
  sourceUrl: snippet.sourceUrl ?? '',
  html: snippet.html,
  css: snippet.css,
  javascript: snippet.javascript,
  tags: snippet.tags,
  category: snippet.category,
  favorite: snippet.favorite,
});
