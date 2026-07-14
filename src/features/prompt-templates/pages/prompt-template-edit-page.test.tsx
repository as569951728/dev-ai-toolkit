import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createMemoryRouter,
  type InitialEntry,
  RouterProvider,
} from 'react-router-dom';

import { PromptTemplateEditPage } from '@/features/prompt-templates/pages/prompt-template-edit-page';
import { createPromptTemplateNavigationState } from '@/features/prompt-templates/lib/prompt-template-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import type { PromptTemplate } from '@/types/prompt-template';

function createRepository(
  templates: PromptTemplate[],
): PromptTemplateRepository {
  let storedTemplates = [...templates];

  return {
    loadAll: () => [...storedTemplates],
    saveAll: (nextTemplates) => {
      storedTemplates = [...nextTemplates];
    },
  };
}

function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const { deleteTemplate } = usePromptTemplates();

  return (
    <button type="button" onClick={() => deleteTemplate(templateId)}>
      Delete externally
    </button>
  );
}

function renderEditPage(path: InitialEntry, templates: PromptTemplate[]) {
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

function renderEditPageWithExternalDelete(template: PromptTemplate) {
  const repository = createRepository([template]);
  const router = createMemoryRouter(
    [
      {
        path: '/prompts/:promptId/edit',
        element: (
          <PromptTemplatesProvider repository={repository}>
            <PromptTemplateEditPage />
            <DeleteTemplateButton templateId={template.id} />
          </PromptTemplatesProvider>
        ),
      },
      {
        path: '/prompts',
        element: <h1>Prompt Templates</h1>,
      },
    ],
    { initialEntries: [`/prompts/${template.id}/edit`] },
  );

  render(<RouterProvider router={router} />);

  return { repository, router };
}

afterEach(() => {
  cleanup();
});

describe('PromptTemplateEditPage', () => {
  it('returns to the filtered template list when editing is cancelled', () => {
    const template = starterPromptTemplates[0]!;
    const listPath = '/prompts?search=Review&tag=review';
    const router = renderEditPage(
      {
        pathname: `/prompts/${template.id}/edit`,
        state: createPromptTemplateNavigationState(listPath),
      },
      [template],
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));

    expect(router.state.location.pathname).toBe('/prompts');
    expect(router.state.location.search).toBe('?search=Review&tag=review');
  });

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

  it('shows the missing state when a clean source template is deleted', () => {
    const template = starterPromptTemplates[0]!;

    renderEditPageWithExternalDelete(template);

    fireEvent.click(
      screen.getByRole('button', { name: 'Delete externally' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Template not found' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('preserves a local draft when the source template is deleted', () => {
    const template = starterPromptTemplates[0]!;
    const { repository, router } =
      renderEditPageWithExternalDelete(template);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Recovered local draft' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete externally' }),
    );

    expect(screen.getByLabelText('Name')).toHaveValue(
      'Recovered local draft',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved template was deleted in another tab. Your local draft is still here. Restore it as a new template to keep your changes.',
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Restore as new template' }),
    );

    expect(router.state.location.pathname).toBe('/prompts');
    expect(repository.loadAll()).toEqual([
      expect.objectContaining({
        name: 'Recovered local draft',
      }),
    ]);
    expect(repository.loadAll()[0]?.id).not.toBe(template.id);
  });
});
