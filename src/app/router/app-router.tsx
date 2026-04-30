import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import { AppNavigation } from '@/components/layout/app-navigation';
import { PromptPlaygroundPage } from '@/features/prompt-playground/pages/prompt-playground-page';
import { PromptTemplateCreatePage } from '@/features/prompt-templates/pages/prompt-template-create-page';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';
import { PromptTemplateEditPage } from '@/features/prompt-templates/pages/prompt-template-edit-page';
import { PromptTemplateListPage } from '@/features/prompt-templates/pages/prompt-template-list-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';

function RootLayout() {
  return (
    <PromptTemplatesProvider>
      <main className="app-shell">
        <div className="page-frame">
          <AppNavigation />
          <Outlet />
        </div>
      </main>
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
        element: <Navigate to="/playground" replace />,
      },
      {
        path: 'playground',
        element: <PromptPlaygroundPage />,
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
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
