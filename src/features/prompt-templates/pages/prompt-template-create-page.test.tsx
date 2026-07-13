import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { PromptTemplateCreatePage } from '@/features/prompt-templates/pages/prompt-template-create-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

function createRunRepository(runs: PromptRunRecord[]): PromptRunRepository {
  return {
    loadAll: () => [...runs],
    saveAll: () => undefined,
  };
}

function createTemplateRepository(): PromptTemplateRepository & {
  snapshot: () => PromptTemplate[];
} {
  let templates: PromptTemplate[] = [];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
    snapshot: () => [...templates],
  };
}

function renderCreatePage(initialEntry: string, runs: PromptRunRecord[]) {
  const templateRepository = createTemplateRepository();
  const router = createMemoryRouter(
    [
      {
        path: '/create-template',
        element: (
          <PromptTemplatesProvider repository={templateRepository}>
            <PromptRunsProvider repository={createRunRepository(runs)}>
              <PromptTemplateCreatePage />
            </PromptRunsProvider>
          </PromptTemplatesProvider>
        ),
      },
      {
        path: '/prompts',
        element: <div>Prompt Template List Destination</div>,
      },
    ],
    { initialEntries: [initialEntry] },
  );

  render(<RouterProvider router={router} />);

  return { templateRepository };
}

afterEach(() => {
  cleanup();
});

describe('PromptTemplateCreatePage', () => {
  it('creates a template explicitly from a saved prompt snapshot', () => {
    const run: PromptRunRecord = {
      id: 'imported/run #1',
      templateId: 'removed-template',
      templateName: 'Code Review Assistant',
      templateVersion: 2,
      variables: { repository_name: 'dev-ai-toolkit' },
      systemPrompt: 'Review dev-ai-toolkit carefully.',
      userPrompt: 'Focus on regression risks.',
      createdAt: '2026-07-13T08:00:00.000Z',
    };
    const { templateRepository } = renderCreatePage(
      '/create-template?runId=imported%2Frun%20%231',
      [run],
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Prefilled from a saved prompt snapshot.',
    );
    expect(screen.getByLabelText('Name')).toHaveValue(
      'Code Review Assistant snapshot',
    );
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Created from a saved prompt snapshot.',
    );
    expect(screen.getByLabelText('System prompt')).toHaveValue(
      'Review dev-ai-toolkit carefully.',
    );
    expect(screen.getByLabelText('User prompt')).toHaveValue(
      'Focus on regression risks.',
    );
    expect(templateRepository.snapshot()).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Create template' }));

    expect(
      screen.getByText('Prompt Template List Destination'),
    ).toBeInTheDocument();
    expect(templateRepository.snapshot()).toEqual([
      expect.objectContaining({
        name: 'Code Review Assistant snapshot',
        description: 'Created from a saved prompt snapshot.',
        systemPrompt: 'Review dev-ai-toolkit carefully.',
        userPrompt: 'Focus on regression risks.',
        tags: [],
      }),
    ]);
  });

  it('falls back to a blank form when the requested run is missing', () => {
    const { templateRepository } = renderCreatePage(
      '/create-template?runId=missing-run',
      [],
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The requested saved run is no longer available.',
    );
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('System prompt')).toHaveValue('');
    expect(templateRepository.snapshot()).toEqual([]);
  });
});
