import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptRunDetailPage } from '@/features/prompt-runs/pages/prompt-run-detail-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

function createTemplateRepository(
  initialTemplates = mockPromptTemplates,
): PromptTemplateRepository {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
  };
}

function createRunRepository(initialRuns: PromptRunRecord[]): PromptRunRepository {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
  };
}

function renderRunDetail(
  initialEntry: string,
  initialRuns: PromptRunRecord[],
  templateRepository = createTemplateRepository(),
) {
  const runRepository = createRunRepository(initialRuns);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={templateRepository}>
        <PromptRunsProvider repository={runRepository}>
          <Routes>
            <Route path="/runs/:runId" element={<PromptRunDetailPage />} />
          </Routes>
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe('PromptRunDetailPage', () => {
  it('shows a saved run with variables, prompts, and source template link', () => {
    renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: mockPromptTemplates[0]!.id,
        templateName: mockPromptTemplates[0]!.name,
        templateVersion: 2,
        variables: { repository_name: 'dev-ai-toolkit' },
        systemPrompt: 'Review the code carefully.',
        userPrompt: 'Focus on bugs and missing tests.',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('repository_name')).toBeInTheDocument();
    expect(screen.getByText('dev-ai-toolkit')).toBeInTheDocument();
    expect(screen.getByText('Review the code carefully.')).toBeInTheDocument();
    expect(
      screen.getByText('Focus on bugs and missing tests.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View source template' }),
    ).toHaveAttribute('href', `/prompts/${mockPromptTemplates[0]!.id}`);
  });

  it('shows a not-found state when the run is missing', () => {
    renderRunDetail('/runs/missing-run', []);

    expect(screen.getByText('Run not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Run History' }),
    ).toHaveAttribute('href', '/runs');
  });
});
