import { render, waitFor } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { DocumentTitle } from '@/components/layout/document-title';

function TitleHarness() {
  return (
    <>
      <DocumentTitle />
      <Outlet />
    </>
  );
}

afterEach(() => {
  document.title = 'dev-ai-toolkit';
});

describe('DocumentTitle', () => {
  it('uses the active route title after client-side navigation', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <TitleHarness />,
          children: [
            {
              index: true,
              handle: { documentTitleKey: 'title.overview' },
              element: <p>Overview</p>,
            },
            {
              path: 'api-builder',
              handle: { documentTitleKey: 'title.api' },
              element: <p>API Builder</p>,
            },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(document.title).toBe('Overview | dev-ai-toolkit');
    });

    await router.navigate('/api-builder');

    await waitFor(() => {
      expect(document.title).toBe('API Builder | dev-ai-toolkit');
    });
  });
});
