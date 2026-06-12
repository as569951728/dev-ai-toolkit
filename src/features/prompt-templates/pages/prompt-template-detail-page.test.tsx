import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

function createTemplateRepository(
  initialTemplates = starterPromptTemplates,
): PromptTemplateRepository & { snapshot: () => PromptTemplate[] } {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
    snapshot: () => [...templates],
  };
}

function createRunRepository(
  initialRuns: PromptRunRecord[] = [],
): PromptRunRepository {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
  };
}

afterEach(() => {
  cleanup();
});

describe('PromptTemplateDetailPage', () => {
  it('opens a recent run from the template detail activity list', () => {
    const template = starterPromptTemplates[0]!;
    const run: PromptRunRecord = {
      id: 'run-from-template-detail',
      templateId: template.id,
      templateName: template.name,
      templateVersion: template.version,
      variables: {
        component: 'PromptTemplateDetail',
      },
      systemPrompt: template.systemPrompt,
      userPrompt: template.userPrompt,
      createdAt: '2026-06-12T08:00:00.000Z',
    };

    render(
      <MemoryRouter initialEntries={[`/prompts/${template.id}`]}>
        <PromptTemplatesProvider repository={createTemplateRepository([template])}>
          <PromptRunsProvider repository={createRunRepository([run])}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
              <Route
                path="/runs/:runId"
                element={<div>Run Detail Destination</div>}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View run details' }));

    expect(screen.getByText('Run Detail Destination')).toBeInTheDocument();
  });

  it('does not offer the playground action for an archived prompt template', () => {
    const archivedTemplate = {
      ...starterPromptTemplates[0]!,
      archivedAt: '2026-05-07T08:00:00.000Z',
    };
    const templateRepository = createTemplateRepository([archivedTemplate]);

    render(
      <MemoryRouter initialEntries={[`/prompts/${archivedTemplate.id}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: 'Open in Playground' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
  });

  it('asks for confirmation before deleting a prompt template', () => {
    const templateRepository = createTemplateRepository();
    const templateId = starterPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={[`/prompts/${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
              <Route
                path="/prompts"
                element={<div>Prompt List Destination</div>}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      templateRepository.snapshot().some((template) => template.id === templateId),
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByText('Prompt List Destination')).toBeInTheDocument();
    expect(
      templateRepository.snapshot().some((template) => template.id === templateId),
    ).toBe(false);
  });
});
