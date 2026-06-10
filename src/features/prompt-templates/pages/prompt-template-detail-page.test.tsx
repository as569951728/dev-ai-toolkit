import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

function createTemplateRepository(
  initialTemplates = mockPromptTemplates,
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
  it('asks for confirmation before deleting a prompt template', () => {
    const templateRepository = createTemplateRepository();
    const templateId = mockPromptTemplates[0]!.id;

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
