import { beforeEach, describe, expect, it } from 'vitest';
import { defaultWorkspacePreferences } from '../domain/workspace-preferences';
import {
  loadWorkspacePreferences,
  saveWorkspacePreferences,
  workspacePreferencesStorageKey,
} from './browser-preferences-store';

describe('browser preferences store', () => {
  beforeEach(() => window.localStorage.clear());

  it('migrates legacy workspace settings without dropping the new theme value', () => {
    window.localStorage.setItem(workspacePreferencesStorageKey, JSON.stringify({
      autoRun: false,
      autoSaveInterval: 2,
      editorFontSize: 16,
      wordWrap: false,
    }));

    expect(loadWorkspacePreferences()).toEqual({
      theme: 'dark',
      autoRun: false,
      autoSaveInterval: 2,
      editorFontSize: 16,
      wordWrap: false,
    });
  });

  it('uses defaults for invalid persisted values', () => {
    window.localStorage.setItem(workspacePreferencesStorageKey, '{ invalid json');

    expect(loadWorkspacePreferences()).toEqual(defaultWorkspacePreferences);
  });

  it('writes one shared settings shape', () => {
    saveWorkspacePreferences({ ...defaultWorkspacePreferences, theme: 'light', editorFontSize: 18 });

    expect(JSON.parse(window.localStorage.getItem(workspacePreferencesStorageKey) ?? '')).toEqual({
      ...defaultWorkspacePreferences,
      theme: 'light',
      editorFontSize: 18,
    });
  });
});
