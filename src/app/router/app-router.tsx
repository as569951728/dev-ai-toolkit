import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import { PromptTemplateCreatePage } from '@/features/prompt-templates/pages/prompt-template-create-page';
import { PromptTemplateEditPage } from '@/features/prompt-templates/pages/prompt-template-edit-page';
import { PromptTemplateListPage } from '@/features/prompt-templates/pages/prompt-template-list-page';

function RootLayout() {
  return (
    <main className="app-shell">
      <div className="page-frame">
        <Outlet />
      </div>
    </main>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/prompts" replace />,
      },
      {
        path: 'prompts',
        element: <PromptTemplateListPage />,
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
