import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css as cssLanguage } from '@codemirror/lang-css';
import { html as htmlLanguage } from '@codemirror/lang-html';
import { javascript as javascriptLanguage } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateSnippetRequest, Snippet } from '@codesnippets/shared';
import {
  createSnippet,
  favoriteSnippet,
  getSnippet,
  updateSnippet,
} from '../api/snippets-api';
import { Button } from '../../../shared/ui/Button';
import { ConsolePanel, type ConsoleEntry } from '../../runner/ui/ConsolePanel';
import { PreviewFrame } from '../../runner/ui/PreviewFrame';
import { RunnerControls } from '../../runner/ui/RunnerControls';
import { SnippetMetadataPanel, type SnippetFormState } from './SnippetMetadataPanel';

type EditorTab = 'html' | 'css' | 'javascript';

type EditorState = SnippetFormState & Pick<Snippet, 'html' | 'css' | 'javascript'>;

const emptySnippet: EditorState = {
  title: 'Untitled snippet',
  description: '',
  html: '<div class="app">Hello CodeSnippets</div>',
  css: '.app { font-family: sans-serif; padding: 1rem; }',
  javascript: 'console.log("Ready")',
  tags: ['demo'],
  category: '',
  favorite: false,
};

const editorTabs: Array<{ key: EditorTab; label: string }> = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'javascript', label: 'JavaScript' },
];

const toEditorState = (snippet: Snippet): EditorState => ({
  title: snippet.title,
  description: snippet.description,
  html: snippet.html,
  css: snippet.css,
  javascript: snippet.javascript,
  tags: snippet.tags,
  category: snippet.category,
  favorite: snippet.favorite,
});

export const SnippetEditorPage = () => {
  const { snippetId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [editorState, setEditorState] = useState<EditorState>(emptySnippet);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(JSON.stringify(emptySnippet));
  const [runVersion, setRunVersion] = useState(0);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);

  const snippetQuery = useQuery({
    queryKey: ['snippet', snippetId],
    queryFn: () => getSnippet(snippetId!),
    enabled: Boolean(snippetId),
  });

  useEffect(() => {
    if (snippetQuery.data) {
      const nextState = toEditorState(snippetQuery.data);
      setEditorState(nextState);
      setSavedSnapshot(JSON.stringify(nextState));
      setRunVersion((value) => value + 1);
    }
  }, [snippetQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateSnippetRequest = {
        title: editorState.title,
        description: editorState.description,
        html: editorState.html,
        css: editorState.css,
        javascript: editorState.javascript,
        tags: editorState.tags,
        category: editorState.category,
      };

      if (snippetId) {
        return updateSnippet(snippetId, { ...payload, favorite: editorState.favorite });
      }

      return createSnippet(payload);
    },
    onSuccess: async (snippet) => {
      const nextState = toEditorState(snippet);
      setEditorState(nextState);
      setSavedSnapshot(JSON.stringify(nextState));
      await queryClient.invalidateQueries({ queryKey: ['snippets'] });
      await queryClient.invalidateQueries({ queryKey: ['snippet', snippet.id] });
      if (!snippetId) {
        navigate(`/snippets/${snippet.id}`);
      }
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => {
      if (!snippetId) {
        throw new Error('Save the snippet before marking it as favorite.');
      }

      return favoriteSnippet(snippetId);
    },
    onSuccess: (snippet) => {
      const nextState = toEditorState(snippet);
      setEditorState(nextState);
      setSavedSnapshot(JSON.stringify(nextState));
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      queryClient.invalidateQueries({ queryKey: ['snippet', snippet.id] });
    },
  });

  const isDirty = useMemo(() => JSON.stringify(editorState) !== savedSnapshot, [editorState, savedSnapshot]);

  const handleRun = useCallback(() => {
    setConsoleEntries([]);
    setRunVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void saveMutation.mutateAsync();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveMutation]);

  return (
    <section className="editor-page stack-lg">
      <div className="page-header">
        <div>
          <h2>{snippetId ? 'Edit snippet' : 'Create snippet'}</h2>
          <p>Iterate on HTML, CSS, and JavaScript locally with a sandboxed preview.</p>
        </div>
        <div className="button-group">
          <Button onClick={() => navigate('/')} variant="ghost">Back to library</Button>
          <Button disabled={!snippetId} onClick={() => favoriteMutation.mutate()} variant="secondary">
            {editorState.favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
        </div>
      </div>

      {snippetQuery.isLoading ? <p>Loading snippet…</p> : null}
      {snippetQuery.error ? <p className="status status--error">{(snippetQuery.error as Error).message}</p> : null}
      {saveMutation.error ? <p className="status status--error">{(saveMutation.error as Error).message}</p> : null}
      {favoriteMutation.error ? <p className="status status--error">{(favoriteMutation.error as Error).message}</p> : null}

      <RunnerControls
        isDirty={isDirty}
        isSaving={saveMutation.isPending}
        onRun={handleRun}
        onSave={() => saveMutation.mutate()}
      />

      <div className="editor-layout">
        <div className="editor-column stack-md">
          <div className="tab-strip">
            {editorTabs.map((tab) => (
              <button
                className={tab.key === activeTab ? 'tab tab--active' : 'tab'}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="editor-surface">
            {activeTab === 'html' ? (
              <CodeMirror
                height="320px"
                extensions={[htmlLanguage()]}
                theme={oneDark}
                value={editorState.html}
                onChange={(value) => setEditorState((current) => ({ ...current, html: value }))}
              />
            ) : null}
            {activeTab === 'css' ? (
              <CodeMirror
                height="320px"
                extensions={[cssLanguage()]}
                theme={oneDark}
                value={editorState.css}
                onChange={(value) => setEditorState((current) => ({ ...current, css: value }))}
              />
            ) : null}
            {activeTab === 'javascript' ? (
              <CodeMirror
                height="320px"
                extensions={[javascriptLanguage()]}
                theme={oneDark}
                value={editorState.javascript}
                onChange={(value) => setEditorState((current) => ({ ...current, javascript: value }))}
              />
            ) : null}
          </div>
          <SnippetMetadataPanel
            value={editorState}
            onChange={(next) => setEditorState((current) => ({ ...current, ...next }))}
          />
        </div>

        <div className="preview-column stack-md">
          <PreviewFrame
            css={editorState.css}
            html={editorState.html}
            javascript={editorState.javascript}
            onReset={handleRun}
            onRun={handleRun}
            runVersion={runVersion}
            onConsoleMessage={(entry) => setConsoleEntries((current) => [...current, entry])}
          />
          <ConsolePanel entries={consoleEntries} onClear={() => setConsoleEntries([])} />
        </div>
      </div>
    </section>
  );
};
