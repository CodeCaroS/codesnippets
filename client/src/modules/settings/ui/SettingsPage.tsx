import { useEffect, useState } from 'react';
import type { Settings } from '@codesnippets/shared';
import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../../snippets/api/snippets-api';

const settingsStorageKey = 'codesnippets:settings';

const defaultSettings: Settings = {
  theme: 'system',
  autoSave: false,
  wordWrap: true,
  previewLayout: 'split',
};

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(settingsStorageKey);
    if (saved) {
      setSettings(JSON.parse(saved) as Settings);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  }, [settings]);

  return (
    <section className="panel stack-lg">
      <div>
        <h2>Settings</h2>
        <p>Personalize editor behavior and confirm the local API is reachable.</p>
      </div>

      <div className="settings-grid">
        <label className="field">
          <span className="field__label">Theme</span>
          <select
            className="input"
            value={settings.theme}
            onChange={(event) => setSettings((current) => ({ ...current, theme: event.target.value as Settings['theme'] }))}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="field">
          <span className="field__label">Preview layout</span>
          <select
            className="input"
            value={settings.previewLayout}
            onChange={(event) =>
              setSettings((current) => ({ ...current, previewLayout: event.target.value as Settings['previewLayout'] }))
            }
          >
            <option value="split">Split</option>
            <option value="stacked">Stacked</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            checked={settings.autoSave}
            type="checkbox"
            onChange={(event) => setSettings((current) => ({ ...current, autoSave: event.target.checked }))}
          />
          Enable autosave
        </label>
        <label className="checkbox">
          <input
            checked={settings.wordWrap}
            type="checkbox"
            onChange={(event) => setSettings((current) => ({ ...current, wordWrap: event.target.checked }))}
          />
          Enable word wrap
        </label>
      </div>

      <div className="health-card">
        <h3>Backend status</h3>
        {healthQuery.isLoading ? <p>Checking health…</p> : null}
        {healthQuery.error ? <p className="status status--error">{(healthQuery.error as Error).message}</p> : null}
        {healthQuery.data ? (
          <ul>
            <li>Status: {healthQuery.data.status}</li>
            <li>Database: {healthQuery.data.database}</li>
            <li>Version: {healthQuery.data.version}</li>
            <li>Time: {new Date(healthQuery.data.timestamp).toLocaleString()}</li>
          </ul>
        ) : null}
      </div>
    </section>
  );
};
