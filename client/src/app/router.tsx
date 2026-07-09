import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { SnippetEditorPage } from '../modules/snippets/ui/SnippetEditorPage';
import { SnippetExplorerPage } from '../modules/library/ui/SnippetExplorerPage';
import { ImportExportPanel } from '../modules/import-export/ui/ImportExportPanel';
import { SettingsPage } from '../modules/settings/ui/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <SnippetExplorerPage />,
      },
      {
        path: 'snippets/new',
        element: <SnippetEditorPage />,
      },
      {
        path: 'snippets/:snippetId',
        element: <SnippetEditorPage />,
      },
      {
        path: 'import-export',
        element: <ImportExportPanel />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
