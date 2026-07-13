import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { PromptTemplateEditPage } from '@/features/prompt-templates/pages/prompt-template-edit-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import type { PromptTemplate } from '@/types/prompt-template';

function createRepository(
  templates: PromptTemplate[],
): PromptTemplateRepository {
  return {
    loadAll: () => [...templates],
    saveAll: () => undefined,
  };
}

function renderEditPage(path: string, templates: PromptTemplate[]) {
  const router = createMemoryRouter(
    [
      {
        path: '/prompts/:promptId/edit',
        element: (
          <PromptTemplatesProvider repository={createRepository(templates)}>
            <PromptTemplateEditPage />
          </PromptTemplatesProvider>
        ),
      },
      {
        path: '/prompts',
        element: <h1>Prompt Templates</h1>,
      },
    ],
    { initialEntries: [path] },
  );

  render(<RouterProvider router={router} />);

  return router;
}

afterEach(() => {
  cleanup();
});

describe('PromptTemplateEditPage', () => {
  it('explains when the requested template is missing', () => {
    const router = renderEditPage('/prompts/missing-template/edit', []);

    expect(router.state.location.pathname).toBe(
      '/prompts/missing-template/edit',
    );
    expect(
      screen.getByRole('heading', { name: 'Template not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Prompt Templates' }),
    ).toHaveAttribute('href', '/prompts');
  });

  it('loads the existing template into the edit form', () => {
    const template = starterPromptTemplates[0]!;

    renderEditPage(`/prompts/${template.id}/edit`, [template]);

    expect(
      screen.getByRole('heading', { name: template.name }),
    ).toBeInTheDocument();
    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue(template.name);
    expect(screen.getByLabelText('System prompt')).toHaveValue(
      template.systemPrompt,
    );
  });
});
