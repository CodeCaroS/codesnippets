import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { SnippetEditorPage } from '../modules/snippets/ui/SnippetEditorPage';
import { ImportExportPanel } from '../modules/import-export/ui/ImportExportPanel';
import { SettingsPage } from '../modules/settings/ui/SettingsPage';
import { AgentGuidePage } from '../modules/agent-guide/ui/AgentGuidePage';
import { WorkspacePage } from '../modules/workspace/ui/WorkspacePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <WorkspacePage />,
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
      {
        path: 'agent-guide',
        element: <AgentGuidePage />,
      },
    ],
  },
]);
