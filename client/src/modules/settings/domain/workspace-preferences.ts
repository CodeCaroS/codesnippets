export type WorkspaceTheme = 'dark' | 'light';

export type WorkspacePreferences = {
  theme: WorkspaceTheme;
  autoRun: boolean;
  editorFontSize: number;
  autoSaveInterval: number;
  wordWrap: boolean;
};

export const defaultWorkspacePreferences: WorkspacePreferences = {
  theme: 'dark',
  autoRun: true,
  editorFontSize: 14,
  autoSaveInterval: 0,
  wordWrap: true,
};
