import { defaultWorkspacePreferences, type WorkspacePreferences } from '../domain/workspace-preferences';

export const workspacePreferencesStorageKey = 'codesnippets:workspace-settings';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isTheme = (value: unknown): value is WorkspacePreferences['theme'] => value === 'dark' || value === 'light';

const parseWorkspacePreferences = (value: unknown): WorkspacePreferences => {
  if (!isRecord(value)) {
    return defaultWorkspacePreferences;
  }

  return {
    theme: isTheme(value.theme) ? value.theme : defaultWorkspacePreferences.theme,
    autoRun: typeof value.autoRun === 'boolean' ? value.autoRun : defaultWorkspacePreferences.autoRun,
    editorFontSize: typeof value.editorFontSize === 'number' && Number.isFinite(value.editorFontSize)
      ? value.editorFontSize
      : defaultWorkspacePreferences.editorFontSize,
    autoSaveInterval: typeof value.autoSaveInterval === 'number' && Number.isFinite(value.autoSaveInterval)
      ? value.autoSaveInterval
      : defaultWorkspacePreferences.autoSaveInterval,
    wordWrap: typeof value.wordWrap === 'boolean' ? value.wordWrap : defaultWorkspacePreferences.wordWrap,
  };
};

export const loadWorkspacePreferences = (): WorkspacePreferences => {
  try {
    const storedValue = window.localStorage.getItem(workspacePreferencesStorageKey);
    return storedValue ? parseWorkspacePreferences(JSON.parse(storedValue)) : defaultWorkspacePreferences;
  } catch {
    return defaultWorkspacePreferences;
  }
};

export const saveWorkspacePreferences = (preferences: WorkspacePreferences): void => {
  try {
    window.localStorage.setItem(workspacePreferencesStorageKey, JSON.stringify(preferences));
  } catch {
    // Browser privacy settings can deny local storage. Preferences remain session-only.
  }
};
