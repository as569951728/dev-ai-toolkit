import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import { AppNavigation } from '@/components/layout/app-navigation';
import { ApiBuilderPage } from '@/features/api-builder/pages/api-builder-page';
import { CodeViewerPage } from '@/features/code-viewer/pages/code-viewer-page';
import { HomePage } from '@/features/home/pages/home-page';
import { JsonToolsPage } from '@/features/json-tools/pages/json-tools-page';
import { NotFoundPage } from '@/features/not-found/pages/not-found-page';
import { PromptDiffPage } from '@/features/prompt-diff/pages/prompt-diff-page';
import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import { PromptRunDetailPage } from '@/features/prompt-runs/pages/prompt-run-detail-page';
import { PromptPlaygroundPage } from '@/features/prompt-playground/pages/prompt-playground-page';
import { PromptRunHistoryPage } from '@/features/prompt-runs/pages/prompt-run-history-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import { PromptTemplateCreatePage } from '@/features/prompt-templates/pages/prompt-template-create-page';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';
import { PromptTemplateEditPage } from '@/features/prompt-templates/pages/prompt-template-edit-page';
import { PromptTemplateListPage } from '@/features/prompt-templates/pages/prompt-template-list-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import { WorkspaceBackupPage } from '@/features/workspace-backup/pages/workspace-backup-page';

function RootLayout() {
  return (
    <PromptTemplatesProvider>
      <PromptRunsProvider>
        <PromptRunNotesProvider>
          <main className="app-shell">
            <div className="page-frame">
              <AppNavigation />
              <Outlet />
            </div>
          </main>
        </PromptRunNotesProvider>
      </PromptRunsProvider>
    </PromptTemplatesProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'playground',
        element: <PromptPlaygroundPage />,
      },
      {
        path: 'runs',
        element: <PromptRunHistoryPage />,
      },
      {
        path: 'runs/:runId',
        element: <PromptRunDetailPage />,
      },
      {
        path: 'prompts',
        element: <PromptTemplateListPage />,
      },
      {
        path: 'prompts/:promptId',
        element: <PromptTemplateDetailPage />,
      },
      {
        path: 'prompts/new',
        element: <PromptTemplateCreatePage />,
      },
      {
        path: 'prompts/:promptId/edit',
        element: <PromptTemplateEditPage />,
      },
      {
        path: 'json-tools',
        element: <JsonToolsPage />,
      },
      {
        path: 'api-builder',
        element: <ApiBuilderPage />,
      },
      {
        path: 'code-viewer',
        element: <CodeViewerPage />,
      },
      {
        path: 'prompt-diff',
        element: <PromptDiffPage />,
      },
      {
        path: 'workspace',
        element: <WorkspaceBackupPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
