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
import { useLocalization } from '@/features/localization/localization-context';
import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';

function lazyPage(loadPage: () => Promise<ComponentType>) {
  return async () => ({ Component: await loadPage() });
}

function RootLayout() {
  const { t } = useLocalization();

  return (
    <PromptTemplatesProvider>
      <PromptRunsProvider>
        <PromptRunNotesProvider>
          <DocumentTitle />
          <ScrollToTop />
          <a className="skip-link" href="#main-content">
            {t('layout.skip')}
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

function InitialRouteFallback() {
  const { t } = useLocalization();

  return (
    <div className="app-shell">
      <div className="page-frame">
        <main id="main-content" aria-busy="true">
          <p role="status">{t('layout.loading')}</p>
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    HydrateFallback: InitialRouteFallback,
    children: [
      {
        index: true,
        handle: { documentTitleKey: 'title.overview' },
        element: <HomePage />,
      },
      {
        path: 'playground',
        handle: { documentTitleKey: 'title.playground' },
        lazy: lazyPage(() =>
          import('@/features/prompt-playground/pages/prompt-playground-page')
            .then(({ PromptPlaygroundPage }) => PromptPlaygroundPage),
        ),
      },
      {
        path: 'runs',
        handle: { documentTitleKey: 'title.runs' },
        lazy: lazyPage(() =>
          import('@/features/prompt-runs/pages/prompt-run-history-page')
            .then(({ PromptRunHistoryPage }) => PromptRunHistoryPage),
        ),
      },
      {
        path: 'runs/:runId',
        handle: { documentTitleKey: 'title.run' },
        lazy: lazyPage(() =>
          import('@/features/prompt-runs/pages/prompt-run-detail-page')
            .then(({ PromptRunDetailPage }) => PromptRunDetailPage),
        ),
      },
      {
        path: 'prompts',
        handle: { documentTitleKey: 'title.templates' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-list-page')
            .then(({ PromptTemplateListPage }) => PromptTemplateListPage),
        ),
      },
      {
        path: 'prompts/:promptId',
        handle: { documentTitleKey: 'title.template' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-detail-page')
            .then(({ PromptTemplateDetailPage }) => PromptTemplateDetailPage),
        ),
      },
      {
        path: 'create-template',
        handle: { documentTitleKey: 'title.createTemplate' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-create-page')
            .then(({ PromptTemplateCreatePage }) => PromptTemplateCreatePage),
        ),
      },
      {
        path: 'prompts/:promptId/edit',
        handle: { documentTitleKey: 'title.editTemplate' },
        lazy: lazyPage(() =>
          import('@/features/prompt-templates/pages/prompt-template-edit-page')
            .then(({ PromptTemplateEditPage }) => PromptTemplateEditPage),
        ),
      },
      {
        path: 'json-tools',
        handle: { documentTitleKey: 'title.json' },
        lazy: lazyPage(() =>
          import('@/features/json-tools/pages/json-tools-page')
            .then(({ JsonToolsPage }) => JsonToolsPage),
        ),
      },
      {
        path: 'api-builder',
        handle: { documentTitleKey: 'title.api' },
        lazy: lazyPage(() =>
          import('@/features/api-builder/pages/api-builder-page')
            .then(({ ApiBuilderPage }) => ApiBuilderPage),
        ),
      },
      {
        path: 'code-viewer',
        handle: { documentTitleKey: 'title.code' },
        lazy: lazyPage(() =>
          import('@/features/code-viewer/pages/code-viewer-page')
            .then(({ CodeViewerPage }) => CodeViewerPage),
        ),
      },
      {
        path: 'prompt-diff',
        handle: { documentTitleKey: 'title.diff' },
        lazy: lazyPage(() =>
          import('@/features/prompt-diff/pages/prompt-diff-page')
            .then(({ PromptDiffPage }) => PromptDiffPage),
        ),
      },
      {
        path: 'workspace',
        handle: { documentTitleKey: 'title.workspace' },
        lazy: lazyPage(() =>
          import('@/features/workspace-backup/pages/workspace-backup-page')
            .then(({ WorkspaceBackupPage }) => WorkspaceBackupPage),
        ),
      },
      {
        path: 'workspace-backup',
        handle: { documentTitleKey: 'title.workspace' },
        element: <Navigate replace to="/workspace" />,
      },
      {
        path: '*',
        handle: { documentTitleKey: 'title.notFound' },
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
