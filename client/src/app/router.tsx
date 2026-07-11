import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';

const WorkspacePage = lazy(() => import('../modules/workspace/ui/WorkspacePage').then((module) => ({ default: module.WorkspacePage })));
const SnippetEditorPage = lazy(() => import('../modules/snippets/ui/SnippetEditorPage').then((module) => ({ default: module.SnippetEditorPage })));
const ImportExportPanel = lazy(() => import('../modules/import-export/ui/ImportExportPanel').then((module) => ({ default: module.ImportExportPanel })));
const SettingsPage = lazy(() => import('../modules/settings/ui/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const AgentGuidePage = lazy(() => import('../modules/agent-guide/ui/AgentGuidePage').then((module) => ({ default: module.AgentGuidePage })));

export const appRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="route-loading">Loading workspace...</div>}>
            <WorkspacePage />
          </Suspense>
        ),
      },
      { path: 'snippets/new', element: <Suspense fallback={<div className="route-loading">Loading editor...</div>}><SnippetEditorPage /></Suspense> },
      { path: 'snippets/:snippetId', element: <Suspense fallback={<div className="route-loading">Loading editor...</div>}><SnippetEditorPage /></Suspense> },
      { path: 'import-export', element: <Suspense fallback={<div className="route-loading">Loading import tools...</div>}><ImportExportPanel /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<div className="route-loading">Loading settings...</div>}><SettingsPage /></Suspense> },
      { path: 'agent-guide', element: <Suspense fallback={<div className="route-loading">Loading guide...</div>}><AgentGuidePage /></Suspense> },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
