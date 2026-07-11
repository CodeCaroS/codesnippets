import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import type { CreateSnippetRequest, Snippet } from '@codesnippets/shared';
import { loadWorkspacePreferences, saveWorkspacePreferences, type WorkspacePreferences } from '../../settings';
import {
} from '../../snippets/api/snippets-api';
import { ConsolePanel, type ConsoleEntry } from '../../runner/ui/ConsolePanel';
import { PreviewFrame } from '../../runner/ui/PreviewFrame';
import { emptyEditorState, toEditorState, type EditorState, type SnippetTemplate } from '../domain/workspace-editor';
import { loadCustomTemplates, saveCustomTemplates } from '../infrastructure/browser-template-store';
import { useWorkspaceLibraryData } from '../presentation/use-workspace-library-data';
import { useWorkspaceSnippetMutations } from '../presentation/use-workspace-snippet-mutations';
import {
  Archive,
  Copy,
  FileCode,
  FolderDot,
  FolderOpen,
  Play,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';

type EditorTab = 'html' | 'css' | 'javascript' | 'metadata';
type ViewFilter = 'all' | 'favorites' | 'archived';

const emptySnippets: Snippet[] = [];

const starterSnippet: CreateSnippetRequest = {
  title: 'New Custom Snippet',
  category: 'Examples',
  description: 'Edit the HTML and watch it compile.',
  tags: ['demo', 'workspace'],
  html:
    '<div class="snippet-demo-card">\n' +
    '  <h2>New Custom Snippet</h2>\n' +
    '  <p>Edit the HTML and watch me compile.</p>\n' +
    '  <button id="clickBtn">Click Me</button>\n' +
    '</div>',
  css:
    '/* Write your styling declarations here */\n' +
    'body { background: #050505; color: #e0e0e0; font-family: system-ui, sans-serif; padding: 24px; }\n' +
    '.snippet-demo-card { max-width: 320px; margin: 0 auto; border: 1px solid #222; background: #080808; padding: 24px; }\n' +
    '.snippet-demo-card h2 { margin: 0 0 8px; color: #c5a059; }\n' +
    '.snippet-demo-card p { color: #888; }\n' +
    '#clickBtn { border: 0; background: #c5a059; color: #000; padding: 10px 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(197, 160, 89, 0.3); }',
  javascript:
    '// Write your runtime JS interactions here\n' +
    'const btn = document.getElementById("clickBtn");\n' +
    'if (btn) btn.addEventListener("click", () => console.log("Custom code running perfectly!"));',
};

const snippetTemplates: SnippetTemplate[] = [
  {
    id: 'react-18-cdn',
    name: 'React 18 + CDN',
    title: 'React 18 + CDN',
    category: 'Frameworks',
    description: 'Stateful React 18 counter scaffold using CDN scripts and Babel Standalone.',
    tags: ['react', 'cdn', 'counter'],
    html:
      '<div id="root"></div>\n' +
      '<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>\n' +
      '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n' +
      '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>',
    css:
      'body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050505; color: #e0e0e0; font-family: Inter, system-ui, sans-serif; }\n' +
      '.react-card { width: min(360px, calc(100vw - 32px)); border: 1px solid #222; background: #080808; padding: 24px; }\n' +
      '.react-card h1 { margin: 0 0 8px; color: #c5a059; font-size: 22px; }\n' +
      '.react-card p { color: #888; }\n' +
      '.react-card button { border: 0; background: #c5a059; color: #000; padding: 10px 14px; cursor: pointer; font-weight: 700; }',
    javascript:
      'const { useState } = React;\n' +
      'function App() {\n' +
      '  const [count, setCount] = useState(0);\n' +
      '  return (\n' +
      '    <main className="react-card">\n' +
      '      <h1>React 18 Counter</h1>\n' +
      '      <p>Interactive state is running inside the sandbox.</p>\n' +
      '      <button onClick={() => setCount(count + 1)}>Count: {count}</button>\n' +
      '    </main>\n' +
      '  );\n' +
      '}\n' +
      'ReactDOM.createRoot(document.getElementById("root")).render(<App />);',
  },
  {
    id: 'tailwind-bento',
    name: 'Tailwind Grid / Bento',
    title: 'Tailwind Grid / Bento',
    category: 'Layouts',
    description: 'Offline-compatible bento grid scaffold with utility-inspired class names and native CSS.',
    tags: ['grid', 'bento', 'layout'],
    html:
      '<section class="bento-grid">\n' +
      '  <article class="bento-card bento-card--wide"><span>01</span><h2>Launch Console</h2><p>Dense cards, sharp borders, and hover motion.</p></article>\n' +
      '  <article class="bento-card"><span>02</span><h2>Signals</h2><p>Track local runtime state.</p></article>\n' +
      '  <article class="bento-card"><span>03</span><h2>Warnings</h2><p>Surface risky states early.</p></article>\n' +
      '</section>',
    css:
      'body { margin: 0; min-height: 100vh; background: #050505; color: #e0e0e0; font-family: Inter, system-ui, sans-serif; padding: 24px; }\n' +
      '.bento-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }\n' +
      '.bento-card { border: 1px solid #222; background: #080808; padding: 20px; transition: transform .18s ease, border-color .18s ease; }\n' +
      '.bento-card:hover { transform: translateY(-2px); border-color: rgba(197, 160, 89, .5); }\n' +
      '.bento-card--wide { grid-column: span 2; }\n' +
      '.bento-card span { color: #c5a059; font-family: monospace; font-size: 11px; }\n' +
      '.bento-card h2 { margin: 12px 0 6px; }\n' +
      '.bento-card p { color: #888; }',
    javascript:
      'document.querySelectorAll(".bento-card").forEach((card) => {\n' +
      '  card.addEventListener("mouseenter", () => console.warn("Inspecting", card.querySelector("h2")?.textContent));\n' +
      '});',
  },
  {
    id: 'vue-3-cdn',
    name: 'Vue 3 + CDN',
    title: 'Vue 3 + CDN',
    category: 'Frameworks',
    description: 'Vue 3 Composition API playground loaded from CDN.',
    tags: ['vue', 'cdn', 'composition-api'],
    html:
      '<div id="app">\n' +
      '  <section class="vue-card">\n' +
      '    <h1>{{ message }}</h1>\n' +
      '    <input v-model="message" />\n' +
      '    <button @click="count++">Interactions: {{ count }}</button>\n' +
      '  </section>\n' +
      '</div>\n' +
      '<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>',
    css:
      'body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050505; color: #e0e0e0; font-family: Inter, system-ui, sans-serif; }\n' +
      '.vue-card { width: min(360px, calc(100vw - 32px)); border: 1px solid #222; background: #080808; padding: 24px; display: grid; gap: 12px; }\n' +
      '.vue-card h1 { color: #c5a059; margin: 0; }\n' +
      '.vue-card input { background: #000; border: 1px solid #222; color: #e0e0e0; padding: 10px; }\n' +
      '.vue-card button { border: 0; background: #c5a059; color: #000; padding: 10px; cursor: pointer; font-weight: 700; }',
    javascript:
      'const { createApp, ref } = Vue;\n' +
      'createApp({\n' +
      '  setup() {\n' +
      '    const message = ref("Vue 3 Sandbox");\n' +
      '    const count = ref(0);\n' +
      '    return { message, count };\n' +
      '  }\n' +
      '}).mount("#app");',
  },
];

const editorTabs: Array<{ key: EditorTab; label: string }> = [
  { key: 'html', label: 'index.html' },
  { key: 'css', label: 'styles.css' },
  { key: 'javascript', label: 'script.js' },
  { key: 'metadata', label: 'metadata.json' },
];

const WorkspaceCodeEditor = lazy(() => import('../presentation/workspace-code-editor'));

export const getTemplateMenuPosition = (
  rect: Pick<DOMRect, 'bottom' | 'left' | 'right'>,
  viewportWidth: number,
) => {
  const width = 280;
  const gutter = 12;
  return {
    left: Math.max(gutter, Math.min(rect.left, viewportWidth - width - gutter)),
    top: rect.bottom + 8,
  };
};

export const WorkspacePage = () => {
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizingRef.current) return;
      const workspace = document.querySelector<HTMLElement>('.workspace-main');
      if (!workspace) return;
      const ratio = ((event.clientX - workspace.getBoundingClientRect().left) / workspace.clientWidth) * 100;
      setEditorWidth(Math.min(70, Math.max(30, ratio)));
    };
    const stopResizing = () => { isResizingRef.current = false; };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
    };
  }, []);
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [editorState, setEditorState] = useState<EditorState>(emptyEditorState);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(emptyEditorState));
  const [runVersion, setRunVersion] = useState(0);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplateCreatorOpen, setIsTemplateCreatorOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [initialTemplateId, setInitialTemplateId] = useState<string | undefined>();
  const [templateMenuPosition, setTemplateMenuPosition] = useState({ left: 0, top: 0 });
  const [syncedSnippetId, setSyncedSnippetId] = useState('');
  const templateButtonRef = useRef<HTMLButtonElement>(null);
  const [customTemplates, setCustomTemplates] = useState<SnippetTemplate[]>(loadCustomTemplates);
  const [settings, setSettings] = useState<WorkspacePreferences>(loadWorkspacePreferences);

  useEffect(() => {
    saveWorkspacePreferences(settings);
  }, [settings]);

  useEffect(() => {
    saveCustomTemplates(customTemplates);
  }, [customTemplates]);

  const { snippetsQuery, categoriesQuery, tagsQuery, snippetQuery } = useWorkspaceLibraryData({
    selectedCategory,
    selectedId,
    selectedTag,
    viewFilter,
  });

  const snippets = snippetsQuery.data?.data ?? emptySnippets;

  useEffect(() => {
    if (!selectedId && snippets.length > 0) {
      setSelectedId(snippets[0].id);
    }
  }, [selectedId, snippets]);

  useEffect(() => {
    if (snippetQuery.data) {
      const nextState = toEditorState(snippetQuery.data);
      setEditorState(nextState);
      setSavedSnapshot(JSON.stringify(nextState));
      setSyncedSnippetId(snippetQuery.data.id);
      setRunVersion((value) => value + 1);
      setConsoleEntries([]);
    }
  }, [snippetQuery.data]);

  const isDirty = useMemo(() => JSON.stringify(editorState) !== savedSnapshot, [editorState, savedSnapshot]);

  const addConsoleEntry = useCallback((level: ConsoleEntry['level'], text: string) => {
    setConsoleEntries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        level,
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const { saveMutation, createMutation, favoriteMutation, archiveMutation, duplicateMutation, deleteMutation } = useWorkspaceSnippetMutations({
    selectedId, editorState, onSelectedIdChange: setSelectedId, onEditorStateChange: setEditorState,
    onSavedSnapshotChange: setSavedSnapshot, onConsoleEntry: addConsoleEntry, onCreateSuccess: () => setIsCreateOpen(false),
  });

  const filteredSnippets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return snippets.filter((snippet) => {
      const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(snippet.category);
      const matchesTag = selectedTag.length === 0 || selectedTag.some((tag) => snippet.tags.includes(tag));
      const matchesSearch = !query || [
        snippet.title, snippet.description, snippet.sourceUrl, snippet.html, snippet.css, snippet.javascript, snippet.tags.join(' '),
      ].join(' ').toLowerCase().includes(query);
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [searchTerm, selectedCategory, selectedTag, snippets]);

  const categories = categoriesQuery.data?.data ?? [];
  const tags = tagsQuery.data?.data ?? [];
  const templates = useMemo(() => [...snippetTemplates, ...customTemplates], [customTemplates]);

  const handleRun = useCallback(() => {
    setConsoleEntries([]);
    addConsoleEntry('info', 'Executing sandbox compile cycle...');
    setRunVersion((value) => value + 1);
  }, [addConsoleEntry]);

  const handleResetPreview = useCallback(() => {
    setConsoleEntries([]);
    addConsoleEntry('info', 'Resetting sandbox frame...');
    setRunVersion((value) => value + 1);
  }, [addConsoleEntry]);

  const toggleTemplateMenu = useCallback(() => {
    const rect = templateButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setTemplateMenuPosition(getTemplateMenuPosition(rect, window.innerWidth));
    }
    setIsTemplateMenuOpen((value) => !value);
  }, []);

  useEffect(() => {
    if (!settings.autoRun || !isDirty) {
      return;
    }
    const timeout = window.setTimeout(() => setRunVersion((value) => value + 1), 600);
    return () => window.clearTimeout(timeout);
  }, [editorState, isDirty, settings.autoRun]);

  useEffect(() => {
    if (!isDirty || settings.autoSaveInterval <= 0) {
      return;
    }
    const timeout = window.setTimeout(() => saveMutation.mutate(), settings.autoSaveInterval * 1000);
    return () => window.clearTimeout(timeout);
  }, [editorState, isDirty, saveMutation, settings.autoSaveInterval]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveMutation.mutate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveMutation]);

  return (
    <div className="workspace-page">
      <aside className={isLibraryCollapsed ? 'workspace-library workspace-library--collapsed' : 'workspace-library'}>
        <div className="workspace-library__header">
          <div className="workspace-section-title">
            <FolderOpen size={16} />
            <span>Library Explorer</span>
            <button
              aria-label={isLibraryCollapsed ? 'Expand Library Explorer' : 'Collapse Library Explorer'}
              className="workspace-library__toggle"
              onClick={() => setIsLibraryCollapsed((value) => !value)}
              type="button"
            >
              {isLibraryCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>
          <div className="workspace-library__header-actions workspace-library__header-actions--pill">
            <div className="template-menu">
              <button
                aria-expanded={isTemplateMenuOpen}
                aria-haspopup="menu"
                className="reference-button reference-button--quiet"
                onClick={toggleTemplateMenu}
                ref={templateButtonRef}
                type="button"
              >
                <Sparkles size={13} />
                <span>Templates</span>
              </button>
              {isTemplateMenuOpen
                ? createPortal(
                    <div
                      aria-label="Snippet templates"
                      className="template-menu__popover workspace-overlay-menu"
                      role="menu"
                      style={{ left: templateMenuPosition.left, top: templateMenuPosition.top }}
                    >
                      <button
                        aria-label="Save Current as Template"
                        onClick={() => {
                          setIsTemplateMenuOpen(false);
                          setIsTemplateCreatorOpen(true);
                        }}
                        role="menuitem"
                        type="button"
                      >
                        <span>Save Current as Template</span>
                        <small>Store the active editor state as a reusable scaffold.</small>
                      </button>
                      {templates.map((template) => (
                        <button
                          aria-label={template.name}
                          key={template.id}
                          onClick={() => {
                            setInitialTemplateId(template.id);
                            setIsTemplateMenuOpen(false);
                            setIsCreateOpen(true);
                          }}
                          role="menuitem"
                          type="button"
                        >
                          <span>{template.name}</span>
                          <small>{template.description}</small>
                        </button>
                      ))}
                    </div>,
                    document.body,
                  )
                : null}
            </div>
            <button
              className="reference-button reference-button--ghost"
              onClick={() => {
                setInitialTemplateId(undefined);
                setIsCreateOpen(true);
              }}
              type="button"
            >
              New Snippet
            </button>
          </div>
        </div>

        <label className="reference-search">
          <Search size={13} />
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search titles, logs, code..."
            value={searchTerm}
          />
        </label>

        <div className="workspace-library__scroll">
          <div className="segmented-control" role="group">
            {(['all', 'favorites', 'archived'] as const).map((filter) => (
              <button
                className={viewFilter === filter ? 'segmented-control__item segmented-control__item--active' : 'segmented-control__item'}
                key={filter}
                onClick={() => setViewFilter(filter)}
                type="button"
              >
                {filter === 'all' ? 'All' : filter === 'favorites' ? 'Starred' : 'Archived'}
              </button>
            ))}
          </div>

          {categories.length > 0 ? (
            <FilterChips
              icon={<FolderDot size={10} />}
              items={categories.map((category) => category.name)}
              label="Categories"
              onSelect={setSelectedCategory}
              selected={selectedCategory}
            />
          ) : null}

          {tags.length > 0 ? (
            <FilterChips
              items={tags.map((tag) => tag.name)}
              label="Filter by Tag"
              onSelect={setSelectedTag}
              prefix="#"
              selected={selectedTag}
            />
          ) : null}

          <div className="snippet-rail__summary">
            <span>Snippets ({filteredSnippets.length})</span>
            <span>{snippetsQuery.data?.total ?? snippets.length} Items</span>
          </div>

          <div className="snippet-rail">
            {snippetsQuery.isLoading ? <p className="reference-muted">Loading snippets...</p> : null}
            {snippetsQuery.error ? <p className="status status--error">{(snippetsQuery.error as Error).message}</p> : null}
            {filteredSnippets.length === 0 && !snippetsQuery.isLoading ? (
              <div className="reference-empty">
                <FileCode size={20} />
                <span>No snippets match this workspace.</span>
              </div>
            ) : null}
            {filteredSnippets.map((snippet) => (
              <SnippetRailItem
                isSelected={snippet.id === selectedId}
                key={snippet.id}
                onArchive={() => archiveMutation.mutate(snippet.id)}
                onDelete={() => {
                  if (window.confirm(`Delete "${snippet.title}"?`)) {
                    deleteMutation.mutate(snippet.id);
                  }
                }}
                onDuplicate={() => duplicateMutation.mutate(snippet.id)}
                onFavorite={() => favoriteMutation.mutate(snippet.id)}
                onSelect={() => {
                  if (snippet.id !== selectedId) {
                    setSyncedSnippetId('');
                    setSelectedId(snippet.id);
                  }
                }}
                snippet={snippet}
              />
            ))}
          </div>
        </div>
      </aside>

      <section className="workspace-main" style={{ gridTemplateColumns: `minmax(0, ${editorWidth}fr) 8px minmax(340px, ${100 - editorWidth}fr)` }}>
        <div className="workspace-editor">
          <div className="workspace-editor__tabs">
            <div className="workspace-editor__tab-list">
              {editorTabs.map((tab) => (
                <button
                  className={activeTab === tab.key ? 'workspace-editor__tab workspace-editor__tab--active' : 'workspace-editor__tab'}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="workspace-editor__actions">
              {isDirty ? <span className="dirty-pill">UNSAVED</span> : <span className="saved-pill">SAVED</span>}
              <button
                className="reference-button reference-button--ghost"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                type="button"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div
            className={
              activeTab === 'metadata'
                ? 'workspace-editor__body workspace-editor__body--metadata'
                : 'workspace-editor__body workspace-editor__body--code'
            }
          >
            {activeTab === 'html' ? (
              <Suspense fallback={<div className="workspace-editor__loading">Loading editor...</div>}>
                <WorkspaceCodeEditor
                  fontSize={settings.editorFontSize}
                  language="html"
                  onChange={(value) => setEditorState((current) => ({ ...current, html: value }))}
                  value={editorState.html}
                />
              </Suspense>
            ) : null}
            {activeTab === 'css' ? (
              <Suspense fallback={<div className="workspace-editor__loading">Loading editor...</div>}>
                <WorkspaceCodeEditor
                  fontSize={settings.editorFontSize}
                  language="css"
                  onChange={(value) => setEditorState((current) => ({ ...current, css: value }))}
                  value={editorState.css}
                />
              </Suspense>
            ) : null}
            {activeTab === 'javascript' ? (
              <Suspense fallback={<div className="workspace-editor__loading">Loading editor...</div>}>
                <WorkspaceCodeEditor
                  fontSize={settings.editorFontSize}
                  language="javascript"
                  onChange={(value) => setEditorState((current) => ({ ...current, javascript: value }))}
                  value={editorState.javascript}
                />
              </Suspense>
            ) : null}
            {activeTab === 'metadata' ? (
              <MetadataEditor editorState={editorState} setEditorState={setEditorState} />
            ) : null}
          </div>
        </div>

        <div
          aria-label="Resize editor and preview"
          className="workspace-resizer"
          onPointerDown={() => { isResizingRef.current = true; }}
          role="separator"
          tabIndex={0}
        />

        <div className="workspace-preview-stack">
          {selectedId && syncedSnippetId !== selectedId ? (
            <div className="preview-frame preview-frame--loading">
              <div className="preview-frame__header">
                <div className="preview-frame__title">
                  <span className="preview-frame__signal" />
                  <h3>Sandboxed Viewport</h3>
                </div>
                <span className="status">Loading selected snippet...</span>
              </div>
            </div>
          ) : (
            <PreviewFrame
              css={editorState.css}
              html={editorState.html}
              javascript={editorState.javascript}
              onConsoleMessage={(entry) => setConsoleEntries((current) => [...current, { ...entry, timestamp: new Date().toISOString() }])}
              onReset={handleResetPreview}
              onRun={handleRun}
              runVersion={runVersion}
            />
          )}
          <ConsolePanel entries={consoleEntries} onClear={() => setConsoleEntries([])} />
        </div>
      </section>

      <div className="workspace-settings-strip">
        <label>
          <span>Auto-run</span>
          <input
            checked={settings.autoRun}
            onChange={(event) => setSettings((current) => ({ ...current, autoRun: event.target.checked }))}
            type="checkbox"
          />
        </label>
        <label>
          <span>Font</span>
          <input
            max={24}
            min={11}
            onChange={(event) => setSettings((current) => ({ ...current, editorFontSize: Number(event.target.value) }))}
            type="number"
            value={settings.editorFontSize}
          />
        </label>
        <label>
          <span>Autosave</span>
          <select
            onChange={(event) => setSettings((current) => ({ ...current, autoSaveInterval: Number(event.target.value) }))}
            value={settings.autoSaveInterval}
          >
            <option value={0}>Manual</option>
            <option value={1}>1s</option>
            <option value={2}>2s</option>
            <option value={5}>5s</option>
          </select>
        </label>
      </div>

        {isCreateOpen ? (
          <CreateSnippetDialog
            initialTemplateId={initialTemplateId}
            isPending={createMutation.isPending}
          onClose={() => {
            setIsCreateOpen(false);
            setInitialTemplateId(undefined);
          }}
            onCreate={(payload) => createMutation.mutate(payload)}
            templates={templates}
          />
        ) : null}

        {isTemplateCreatorOpen ? (
          <CreateTemplateDialog
            editorState={editorState}
            onClose={() => setIsTemplateCreatorOpen(false)}
            onSave={(template) => {
              setCustomTemplates((current) => [...current, template]);
              setIsTemplateCreatorOpen(false);
            }}
          />
        ) : null}
      </div>
    );
};

const FilterChips = ({
  icon,
  items,
  label,
  onSelect,
  prefix = '',
  selected,
}: {
  icon?: ReactNode;
  items: string[];
  label: string;
  onSelect: (value: string[]) => void;
  prefix?: string;
  selected: string[];
}) => (
  <div className="workspace-filter">
    <div className="workspace-filter__label">
      {icon}
      <span>{label}</span>
    </div>
    <input
      aria-label={label}
      className="workspace-filter__select"
      list={`filter-options-${label.replace(/\s+/g, '-').toLowerCase()}`}
      onChange={(event) => {
        const values = event.target.value
          .split(',')
          .map((value) => value.trim().replace(/^#/, ''))
          .filter(Boolean);
        onSelect(values);
      }}
      placeholder={`${prefix}Type to filter...`}
      value={selected.map((value) => `${prefix}${value}`).join(', ')}
    />
    <datalist id={`filter-options-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      {items.map((item) => <option key={item} value={`${prefix}${item}`} />)}
    </datalist>
    {selected.length > 0 ? (
      <button className="workspace-filter__reset" onClick={() => onSelect([])} type="button">
        Clear selection
      </button>
    ) : null}
  </div>
);

const SnippetRailItem = ({
  isSelected,
  onArchive,
  onDelete,
  onDuplicate,
  onFavorite,
  onSelect,
  snippet,
}: {
  isSelected: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFavorite: () => void;
  onSelect: () => void;
  snippet: Snippet;
}) => (
  <article className={isSelected ? 'snippet-rail-item snippet-rail-item--active' : 'snippet-rail-item'}>
    <button className="snippet-rail-item__main" onClick={onSelect} type="button">
      <span className="snippet-rail-item__title">{snippet.title}</span>
      <span className="snippet-rail-item__description">{snippet.description || 'No description yet.'}</span>
      <span className="snippet-rail-item__meta">
        <span>{snippet.category || 'Uncategorized'}</span>
        <span>{new Date(snippet.updatedAt).toLocaleDateString()}</span>
      </span>
      {snippet.tags.length > 0 ? (
        <span className="snippet-rail-item__tags">
          {snippet.tags.slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </span>
      ) : null}
    </button>
    <div className="snippet-rail-item__actions">
      <button aria-label={`Favorite ${snippet.title}`} onClick={onFavorite} type="button">
        <Star fill={snippet.favorite ? 'currentColor' : 'none'} size={12} />
      </button>
      <button aria-label={`Duplicate ${snippet.title}`} onClick={onDuplicate} type="button">
        <Copy size={12} />
      </button>
      <button aria-label={`Archive ${snippet.title}`} onClick={onArchive} type="button">
        <Archive size={12} />
      </button>
      <button aria-label={`Delete ${snippet.title}`} onClick={onDelete} type="button">
        <Trash2 size={12} />
      </button>
    </div>
  </article>
);

const MetadataEditor = ({
  editorState,
  setEditorState,
}: {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
}) => (
  <div className="metadata-editor metadata-editor--compact">
    <label>
      <span>Snippet Title</span>
      <input value={editorState.title} onChange={(event) => setEditorState((current) => ({ ...current, title: event.target.value }))} />
    </label>
    <label>
      <span>Category Folder</span>
      <input
        value={editorState.category}
        onChange={(event) => setEditorState((current) => ({ ...current, category: event.target.value }))}
      />
    </label>
    <label>
      <span>Tags (comma separated)</span>
      <input
        value={editorState.tags.join(', ')}
        onChange={(event) =>
          setEditorState((current) => ({
            ...current,
            tags: event.target.value
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          }))
        }
      />
    </label>
    <label>
      <span>Project Description / Agent Prompt Context</span>
      <textarea
        rows={5}
        value={editorState.description}
        onChange={(event) => setEditorState((current) => ({ ...current, description: event.target.value }))}
      />
    </label>
    <label>
      <span>Source / Inspiration URL</span>
      <input
        type="url"
        value={editorState.sourceUrl}
        onChange={(event) => setEditorState((current) => ({ ...current, sourceUrl: event.target.value }))}
      />
    </label>
    <label className="metadata-editor__checkbox">
      <input
        checked={editorState.favorite}
        onChange={(event) => setEditorState((current) => ({ ...current, favorite: event.target.checked }))}
        type="checkbox"
      />
      <span>Favorite</span>
    </label>
  </div>
);

const CreateTemplateDialog = ({
  editorState,
  onClose,
  onSave,
}: {
  editorState: EditorState;
  onClose: () => void;
  onSave: (template: SnippetTemplate) => void;
}) => {
  const [name, setName] = useState(editorState.title);
  const [category, setCategory] = useState(editorState.category || 'Custom');
  const [description, setDescription] = useState(editorState.description);
  const [tags, setTags] = useState(editorState.tags.join(', '));

  return (
    <div className="reference-modal-backdrop">
      <form
        className="reference-modal template-creator-modal"
        onSubmit={(event) => {
          event.preventDefault();
          const templateName = name.trim() || 'Custom Template';
          onSave({
            id: `custom-${crypto.randomUUID()}`,
            name: templateName,
            title: templateName,
            category: category.trim() || 'Custom',
            description: description.trim(),
            sourceUrl: editorState.sourceUrl,
            tags: tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
            html: editorState.html,
            css: editorState.css,
            javascript: editorState.javascript,
          });
        }}
      >
        <div className="reference-modal__header">
          <div className="workspace-section-title">
            <Sparkles size={16} />
            <span>Create Template</span>
          </div>
          <button className="reference-button reference-button--quiet" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <label>
          <span>Template Name</span>
          <input aria-label="Template Name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>Category</span>
          <input value={category} onChange={(event) => setCategory(event.target.value)} />
        </label>
        <label>
          <span>Tags</span>
          <input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        <label>
          <span>Description</span>
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <button className="reference-button reference-button--primary" type="submit">
          Save Template
        </button>
      </form>
    </div>
  );
};

const CreateSnippetDialog = ({
  initialTemplateId,
  isPending,
  onClose,
  onCreate,
  templates,
}: {
  initialTemplateId?: string;
  isPending: boolean;
  onClose: () => void;
  onCreate: (payload: CreateSnippetRequest) => void;
  templates: SnippetTemplate[];
}) => {
  const initialTemplate = templates.find((template) => template.id === initialTemplateId);
  const initialPayload = initialTemplate ?? starterSnippet;
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate?.id ?? '');
  const [title, setTitle] = useState(initialPayload.title ?? '');
  const [category, setCategory] = useState(initialPayload.category ?? 'Examples');
  const [description, setDescription] = useState(initialPayload.description ?? '');
  const [sourceUrl, setSourceUrl] = useState(initialPayload.sourceUrl ?? '');
  const [tags, setTags] = useState((initialPayload.tags ?? []).join(', '));
  const [html, setHtml] = useState(initialPayload.html ?? '');
  const [css, setCss] = useState(initialPayload.css ?? '');
  const [javascript, setJavascript] = useState(initialPayload.javascript ?? '');

  const applyTemplate = (template: SnippetTemplate | undefined) => {
    const payload = template ?? starterSnippet;
    setSelectedTemplateId(template?.id ?? '');
    setTitle(payload.title ?? '');
    setCategory(payload.category ?? 'Examples');
    setDescription(payload.description ?? '');
    setSourceUrl(payload.sourceUrl ?? '');
    setTags((payload.tags ?? []).join(', '));
    setHtml(payload.html ?? '');
    setCss(payload.css ?? '');
    setJavascript(payload.javascript ?? '');
  };

  return (
    <div className="reference-modal-backdrop">
      <form
        className="reference-modal"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            title: title.trim() || 'Untitled snippet',
            category: category.trim() || 'Examples',
            description,
            sourceUrl: sourceUrl.trim() || undefined,
            tags: tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
            html,
            css,
            javascript,
          });
        }}
      >
        <div className="reference-modal__header">
          <div className="workspace-section-title">
            <Plus size={16} />
            <span>Create Snippet</span>
          </div>
          <button className="reference-button reference-button--quiet" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <label>
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <div className="template-picker">
          <span>Use Template</span>
          <div className="template-picker__grid">
            <button className={!selectedTemplateId ? 'chip chip--active' : 'chip'} onClick={() => applyTemplate(undefined)} type="button">
              Blank
            </button>
            {templates.map((template) => (
              <button
                aria-label={template.name}
                className={selectedTemplateId === template.id ? 'chip chip--active' : 'chip'}
                key={template.id}
                onClick={() => applyTemplate(template)}
                type="button"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
        <label>
          <span>Category</span>
          <input value={category} onChange={(event) => setCategory(event.target.value)} />
        </label>
        <label>
          <span>Tags</span>
          <input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        <label>
          <span>Description</span>
          <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <button className="reference-button reference-button--primary" disabled={isPending} type="submit">
          {isPending ? 'Creating...' : 'Create Workspace Snippet'}
        </button>
      </form>
    </div>
  );
};
