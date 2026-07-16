import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import { AppFooter } from '@/components/layout/app-footer';
import { AppNavigation } from '@/components/layout/app-navigation';
import { BrowserStorageNotice } from '@/components/layout/browser-storage-notice';
import { DocumentTitle } from '@/components/layout/document-title';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
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
          <DocumentTitle />
          <ScrollToTop />
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <div className="app-shell">
            <div className="page-frame">
              <AppNavigation />
              <main id="main-content" tabIndex={-1}>
                <BrowserStorageNotice />
                <Outlet />
              </main>
              <AppFooter />
            </div>
          </div>
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
        handle: { documentTitle: 'Overview' },
        element: <HomePage />,
      },
      {
        path: 'playground',
        handle: { documentTitle: 'Prompt Playground' },
        element: <PromptPlaygroundPage />,
      },
      {
        path: 'runs',
        handle: { documentTitle: 'Run History' },
        element: <PromptRunHistoryPage />,
      },
      {
        path: 'runs/:runId',
        handle: { documentTitle: 'Prompt Run' },
        element: <PromptRunDetailPage />,
      },
      {
        path: 'prompts',
        handle: { documentTitle: 'Prompt Templates' },
        element: <PromptTemplateListPage />,
      },
      {
        path: 'prompts/:promptId',
        handle: { documentTitle: 'Prompt Template' },
        element: <PromptTemplateDetailPage />,
      },
      {
        path: 'create-template',
        handle: { documentTitle: 'Create Prompt Template' },
        element: <PromptTemplateCreatePage />,
      },
      {
        path: 'prompts/:promptId/edit',
        handle: { documentTitle: 'Edit Prompt Template' },
        element: <PromptTemplateEditPage />,
      },
      {
        path: 'json-tools',
        handle: { documentTitle: 'JSON Tools' },
        element: <JsonToolsPage />,
      },
      {
        path: 'api-builder',
        handle: { documentTitle: 'API Builder' },
        element: <ApiBuilderPage />,
      },
      {
        path: 'code-viewer',
        handle: { documentTitle: 'Code Viewer' },
        element: <CodeViewerPage />,
      },
      {
        path: 'prompt-diff',
        handle: { documentTitle: 'Prompt Diff' },
        element: <PromptDiffPage />,
      },
      {
        path: 'workspace',
        handle: { documentTitle: 'Workspace Backup' },
        element: <WorkspaceBackupPage />,
      },
      {
        path: 'workspace-backup',
        handle: { documentTitle: 'Workspace Backup' },
        element: <Navigate replace to="/workspace" />,
      },
      {
        path: '*',
        handle: { documentTitle: 'Page Not Found' },
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
