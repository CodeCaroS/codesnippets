import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Database, Download, RefreshCw, Save, Settings, Upload } from 'lucide-react';
import { parseImportExportData } from '@codesnippets/shared';
import { loadWorkspacePreferences, saveWorkspacePreferences, type WorkspacePreferences } from '..';
import {
  exportSnippets,
  getCategories,
  getHealth,
  getSnippets,
  getTags,
  importSnippets,
} from '../../snippets/api/snippets-api';

export const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<WorkspacePreferences>(loadWorkspacePreferences);
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

  const savePreferences = (event: FormEvent) => {
    event.preventDefault();
    saveWorkspacePreferences(settings);
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
    mutationFn: importSnippets,
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
      importMutation.mutate(parseImportExportData(JSON.parse(backupPayload)));
    } catch {
      setError('Invalid backup payload. Check the snippet export JSON structure.');
      return;
    }
  };

  return (
    <section className="settings-page">
      <header className="settings-page__hero">
        <div className="settings-page__hero-copy">
          <p className="settings-page__eyebrow">Workspace settings</p>
          <div className="settings-page__title-row">
            <div className="settings-page__title-icon" aria-hidden="true">
              <Settings size={18} />
            </div>
            <h1>Preferences & Backups</h1>
          </div>
          <p className="settings-page__description">
            Set editor defaults, inspect the local database, and move snippet data in or out.
          </p>
        </div>

        <div className="settings-page__snapshot" aria-label="Workspace snapshot">
          <div className="settings-page__stat">
            <span>Backend</span>
            <strong>{healthQuery.data?.status ?? 'checking'}</strong>
          </div>
          <div className="settings-page__stat">
            <span>Snippets</span>
            <strong>{snippetsQuery.data?.total ?? 0}</strong>
          </div>
          <div className="settings-page__stat">
            <span>Tags</span>
            <strong>{tagsQuery.data?.total ?? 0}</strong>
          </div>
        </div>
      </header>

      <div className="settings-page__grid">
        <section aria-label="Editor preferences" className="settings-card settings-card--preferences">
          <div className="settings-card__header">
            <div>
              <h2>Editor Preferences</h2>
              <p>Saved locally in this browser only.</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={savePreferences}>
            <label className="settings-field">
              <span className="settings-field__label">UI visual mode</span>
              <select
                value={settings.theme}
                onChange={(event) => setSettings((current) => ({
                  ...current,
                  theme: event.target.value === 'light' ? 'light' : 'dark',
                }))}
              >
                <option value="dark">Immersive Charcoal</option>
                <option value="light">Classic Slate</option>
              </select>
              <small className="settings-field__help">The workspace currently renders in dark mode.</small>
            </label>

            <label className="settings-field">
              <span className="settings-field__label">Editor font size</span>
              <input
                aria-label="Editor Font Size (px)"
                max={24}
                min={11}
                type="number"
                value={settings.editorFontSize}
                onChange={(event) => setSettings((current) => ({ ...current, editorFontSize: Number(event.target.value) }))}
              />
              <small className="settings-field__help">Used by the code editor and related text surfaces.</small>
            </label>

            <label className="settings-field">
              <span className="settings-field__label">Auto-save interval</span>
              <select
                aria-label="Auto-save interval"
                value={settings.autoSaveInterval}
                onChange={(event) => setSettings((current) => ({ ...current, autoSaveInterval: Number(event.target.value) }))}
              >
                <option value={0}>Manual save only</option>
                <option value={1}>1 second</option>
                <option value={2}>2 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
              <small className="settings-field__help">Applies while editing snippets in the workspace.</small>
            </label>

            <label className="settings-toggle">
              <span>
                <strong>Immediate auto-run</strong>
                <small>Compile the sandbox as you type.</small>
              </span>
              <input
                checked={settings.autoRun}
                type="checkbox"
                onChange={(event) => setSettings((current) => ({ ...current, autoRun: event.target.checked }))}
              />
            </label>

            <label className="settings-toggle">
              <span>
                <strong>Editor word wrap</strong>
                <small>Wrap long lines inside the editor viewport.</small>
              </span>
              <input
                checked={settings.wordWrap}
                type="checkbox"
                onChange={(event) => setSettings((current) => ({ ...current, wordWrap: event.target.checked }))}
              />
            </label>

            <button className="reference-button reference-button--primary settings-action" type="submit">
              <Save size={13} />
              <span>Save preferences</span>
            </button>
          </form>
        </section>

        <div className="settings-page__stack">
          <section aria-label="Database status" className="settings-card">
            <div className="settings-card__header">
              <div>
                <h2>
                  <Database size={13} />
                  Local Database Status
                </h2>
                <p>Live health and content counts from the backend.</p>
              </div>
              <button
                aria-label="Refresh Database Status"
                className="settings-icon-button"
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

            <dl className="settings-status-list">
              <div>
                <dt>Backend</dt>
                <dd>{healthQuery.data?.status ?? 'checking'}</dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd>{healthQuery.data?.database ?? 'checking'}</dd>
              </div>
              <div>
                <dt>Active snippets</dt>
                <dd>{snippetsQuery.data?.total ?? 0}</dd>
              </div>
              <div>
                <dt>Unique categories</dt>
                <dd>{categoriesQuery.data?.total ?? 0}</dd>
              </div>
              <div>
                <dt>Unique tags</dt>
                <dd>{tagsQuery.data?.total ?? 0}</dd>
              </div>
            </dl>
          </section>

          <section aria-label="Backup tools" className="settings-card">
            <div className="settings-card__header">
              <div>
                <h2>
                  <Download size={13} />
                  Backup Library Engine
                </h2>
                <p>Export the full registry or restore a previous backup payload.</p>
              </div>
            </div>

            <button
              className="reference-button reference-button--quiet settings-action settings-action--full"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate()}
              type="button"
            >
              <Download size={13} />
              <span>{exportMutation.isPending ? 'Exporting...' : 'Download database JSON'}</span>
            </button>

            <div className="settings-backup">
              <label className="settings-field">
                <span className="settings-field__label">Paste backup JSON</span>
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
                className="reference-button reference-button--primary settings-action"
                disabled={importMutation.isPending || !backupPayload.trim()}
                onClick={handleImport}
                type="button"
              >
                <Upload size={13} />
                <span>{importMutation.isPending ? 'Importing...' : 'Load backup'}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};
