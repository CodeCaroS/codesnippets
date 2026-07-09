import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Database, Download, RefreshCw, Save, Settings, Upload } from 'lucide-react';
import type { ImportExportData } from '@codesnippets/shared';
import {
  exportSnippets,
  getCategories,
  getHealth,
  getSnippets,
  getTags,
  importSnippets,
} from '../../snippets/api/snippets-api';

type ToolSettings = {
  theme: 'dark' | 'light';
  autoRun: boolean;
  editorFontSize: number;
  autoSaveInterval: number;
  wordWrap: boolean;
};

const settingsStorageKey = 'codesnippets:workspace-settings';

const defaultSettings: ToolSettings = {
  theme: 'dark',
  autoRun: true,
  editorFontSize: 14,
  autoSaveInterval: 0,
  wordWrap: true,
};

export const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<ToolSettings>(defaultSettings);
  const [backupPayload, setBackupPayload] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const healthQuery = useQuery({ queryKey: ['health'], queryFn: getHealth });
  const snippetsQuery = useQuery({
    queryKey: ['snippets', 'settings-status'],
    queryFn: () => getSnippets({ archived: undefined, sort: 'updatedAt', direction: 'desc' }),
  });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: getTags });

  useEffect(() => {
    const saved = window.localStorage.getItem(settingsStorageKey);
    if (saved) {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) as Partial<ToolSettings> });
    }
  }, []);

  const savePreferences = (event: FormEvent) => {
    event.preventDefault();
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    setStatus('System preferences saved.');
    setError('');
  };

  const exportMutation = useMutation({
    mutationFn: exportSnippets,
    onSuccess: (data) => {
      setBackupPayload(JSON.stringify(data, null, 2));
      setStatus(`Exported ${data.snippets.length} snippets.`);
      setError('');
    },
    onError: (err) => {
      setError((err as Error).message);
      setStatus('');
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => importSnippets(JSON.parse(backupPayload) as ImportExportData),
    onSuccess: async (data) => {
      setStatus(`Imported ${data.imported} snippets.`);
      setError('');
      await queryClient.invalidateQueries({ queryKey: ['snippets'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err) => {
      setError((err as Error).message);
      setStatus('');
    },
  });

  const handleImport = () => {
    setError('');
    setStatus('');
    try {
      JSON.parse(backupPayload);
    } catch {
      setError('Invalid JSON format. Check the backup payload syntax.');
      return;
    }
    importMutation.mutate();
  };

  return (
    <section className="settings-tools-page reference-scroll-page">
      <div className="reference-page-title">
        <div className="reference-page-title__icon">
          <Settings size={20} />
        </div>
        <div>
          <h1>System Preferences & Tools</h1>
          <p>Control playground parameters and backup engines</p>
        </div>
      </div>

      <div className="settings-tools-grid settings-tools-grid--ordered">
        <div className="settings-tools-grid__column">
          <section aria-label="Editor preferences" className="reference-panel settings-section settings-section--preferences">
            <h2>Editor & Sandbox Preferences</h2>
            <form className="settings-form" onSubmit={savePreferences}>
              <label>
                <span>UI Visual Mode</span>
                <select
                  value={settings.theme}
                  onChange={(event) => setSettings((current) => ({ ...current, theme: event.target.value as ToolSettings['theme'] }))}
                >
                  <option value="dark">Immersive Charcoal (Dark)</option>
                  <option value="light">Classic Slate (Light - Coming soon)</option>
                </select>
              </label>
              <label>
                <span>Editor Font Size (px)</span>
                <input
                  aria-label="Editor Font Size (px)"
                  max={24}
                  min={11}
                  type="number"
                  value={settings.editorFontSize}
                  onChange={(event) => setSettings((current) => ({ ...current, editorFontSize: Number(event.target.value) }))}
                />
              </label>
              <label>
                <span>Auto-save interval</span>
                <select
                  aria-label="Auto-save interval"
                  value={settings.autoSaveInterval}
                  onChange={(event) => setSettings((current) => ({ ...current, autoSaveInterval: Number(event.target.value) }))}
                >
                  <option value={0}>Manual Save Only (Ctrl+S)</option>
                  <option value={1}>1 Second</option>
                  <option value={2}>2 Seconds</option>
                  <option value={5}>5 Seconds</option>
                  <option value={10}>10 Seconds</option>
                </select>
              </label>
              <label className="settings-form__toggle">
                <span>
                  <strong>Immediate Auto-Run</strong>
                  <small>Compile sandboxed iframe on typing</small>
                </span>
                <input
                  checked={settings.autoRun}
                  type="checkbox"
                  onChange={(event) => setSettings((current) => ({ ...current, autoRun: event.target.checked }))}
                />
              </label>
              <label className="settings-form__toggle">
                <span>
                  <strong>Editor Word Wrap</strong>
                  <small>Wrap long code lines inside the editor viewport</small>
                </span>
                <input
                  checked={settings.wordWrap}
                  type="checkbox"
                  onChange={(event) => setSettings((current) => ({ ...current, wordWrap: event.target.checked }))}
                />
              </label>
              <button className="reference-button reference-button--primary" type="submit">
                <Save size={13} />
                <span>Save Preferences</span>
              </button>
            </form>
          </section>

        </div>

        <div className="settings-tools-grid__column">
          <section aria-label="Database status" className="reference-panel settings-section settings-section--status">
            <div className="settings-panel-header">
              <h2>
                <Database size={13} />
                Local Database Status
              </h2>
              <button
                aria-label="Refresh Database Status"
                className="preview-frame__icon-button"
                onClick={() => {
                  void healthQuery.refetch();
                  void snippetsQuery.refetch();
                  void categoriesQuery.refetch();
                  void tagsQuery.refetch();
                }}
                type="button"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <dl className="database-status-list">
              <div>
                <dt>Backend</dt>
                <dd>{healthQuery.data?.status ?? 'checking'}</dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd>{healthQuery.data?.database ?? 'checking'}</dd>
              </div>
              <div>
                <dt>Active Snippets</dt>
                <dd>{snippetsQuery.data?.total ?? 0}</dd>
              </div>
              <div>
                <dt>Unique Categories</dt>
                <dd>{categoriesQuery.data?.total ?? 0}</dd>
              </div>
              <div>
                <dt>Unique Tags</dt>
                <dd>{tagsQuery.data?.total ?? 0}</dd>
              </div>
            </dl>
          </section>

          <section aria-label="Backup tools" className="reference-panel settings-section settings-section--backup settings-backup-panel">
            <h2>
              <Download size={13} />
              Backup Library Engine
            </h2>
            <p>Export your full snippet registry as JSON or restore an existing CodeSnippets backup payload.</p>
            <button
              className="reference-button reference-button--ghost settings-backup-panel__export"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate()}
              type="button"
            >
              <Download size={13} />
              <span>{exportMutation.isPending ? 'Exporting...' : 'Download Database JSON File'}</span>
            </button>
            <div className="settings-backup-panel__import">
              <h3>
                <Upload size={12} />
                Restore / Import Snippets
              </h3>
              <label>
                <span>Paste Backup JSON</span>
                <textarea
                  rows={12}
                  value={backupPayload}
                  onChange={(event) => setBackupPayload(event.target.value)}
                  placeholder='{ "snippets": [ ... ], "exportedAt": "...", "version": "..." }'
                />
              </label>
              {status ? <div className="settings-status settings-status--ok">{status}</div> : null}
              {error ? (
                <div className="settings-status settings-status--error">
                  <AlertTriangle size={13} />
                  <span>{error}</span>
                </div>
              ) : null}
              <button
                className="reference-button reference-button--primary"
                disabled={importMutation.isPending || !backupPayload.trim()}
                onClick={handleImport}
                type="button"
              >
                {importMutation.isPending ? 'Importing...' : 'Load & Sync Backup Stream'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};
