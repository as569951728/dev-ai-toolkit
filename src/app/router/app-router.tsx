import type { ComponentType } from 'react';
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
import { HomePage } from '@/features/home/pages/home-page';
import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';

function lazyPage(loadPage: () => Promise<ComponentType>) {
  return async () => ({ Component: await loadPage() });
}

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
        lazy: lazyPage(() =>
          import('@/features/prompt-playground/pages/prompt-playground-page')
            .then(({ PromptPlaygroundPage }) => PromptPlaygroundPage),
        ),
      },
      {
        path: 'runs',
        handle: { documentTitle: 'Run History' },
        lazy: lazyPage(() =>
          import('@/features/prompt-runs/pages/prompt-run-history-page')
            .then(({ PromptRunHistoryPage }) => PromptRunHistoryPage),
        ),
      },
      {
        path: 'runs/:runId',
        handle: { documentTitle: 'Prompt Run' },
        lazy: lazyPage(() =>
          import('@/features/prompt-runs/pages/prompt-run-detail-page')
            .then(({ PromptRunDetailPage }) => PromptRunDetailPage),
        ),
      },
      {
        path: 'prompts',
        handle: { documentTitle: 'Prompt Templates' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-list-page')
            .then(({ PromptTemplateListPage }) => PromptTemplateListPage),
        ),
      },
      {
        path: 'prompts/:promptId',
        handle: { documentTitle: 'Prompt Template' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-detail-page')
            .then(({ PromptTemplateDetailPage }) => PromptTemplateDetailPage),
        ),
      },
      {
        path: 'create-template',
        handle: { documentTitle: 'Create Prompt Template' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-create-page')
            .then(({ PromptTemplateCreatePage }) => PromptTemplateCreatePage),
        ),
      },
      {
        path: 'prompts/:promptId/edit',
        handle: { documentTitle: 'Edit Prompt Template' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-edit-page')
            .then(({ PromptTemplateEditPage }) => PromptTemplateEditPage),
        ),
      },
      {
        path: 'json-tools',
        handle: { documentTitle: 'JSON Tools' },
        lazy: lazyPage(() =>
          import('@/features/json-tools/pages/json-tools-page')
            .then(({ JsonToolsPage }) => JsonToolsPage),
        ),
      },
      {
        path: 'api-builder',
        handle: { documentTitle: 'API Builder' },
        lazy: lazyPage(() =>
          import('@/features/api-builder/pages/api-builder-page')
            .then(({ ApiBuilderPage }) => ApiBuilderPage),
        ),
      },
      {
        path: 'code-viewer',
        handle: { documentTitle: 'Code Viewer' },
        lazy: lazyPage(() =>
          import('@/features/code-viewer/pages/code-viewer-page')
            .then(({ CodeViewerPage }) => CodeViewerPage),
        ),
      },
      {
        path: 'prompt-diff',
        handle: { documentTitle: 'Prompt Diff' },
        lazy: lazyPage(() =>
          import('@/features/prompt-diff/pages/prompt-diff-page')
            .then(({ PromptDiffPage }) => PromptDiffPage),
        ),
      },
      {
        path: 'workspace',
        handle: { documentTitle: 'Workspace Backup' },
        lazy: lazyPage(() =>
          import('@/features/workspace-backup/pages/workspace-backup-page')
            .then(({ WorkspaceBackupPage }) => WorkspaceBackupPage),
        ),
      },
      {
        path: 'workspace-backup',
        handle: { documentTitle: 'Workspace Backup' },
        element: <Navigate replace to="/workspace" />,
      },
      {
        path: '*',
        handle: { documentTitle: 'Page Not Found' },
        lazy: lazyPage(() =>
          import('@/features/not-found/pages/not-found-page')
            .then(({ NotFoundPage }) => NotFoundPage),
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
