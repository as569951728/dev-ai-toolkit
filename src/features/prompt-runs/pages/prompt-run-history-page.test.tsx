import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptRunHistoryPage } from '@/features/prompt-runs/pages/prompt-run-history-page';
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

describe('PromptRunHistoryPage', () => {
  it('lists saved runs and links back to the source template', () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository([
      {
        id: 'run-2',
        templateId: mockPromptTemplates[1]!.id,
        templateName: mockPromptTemplates[1]!.name,
        templateVersion: 2,
        variables: { feature_name: 'run-history-page' },
        systemPrompt: 'System B',
        userPrompt: 'User B',
        createdAt: '2026-05-07T09:10:00.000Z',
      },
      {
        id: 'run-1',
        templateId: mockPromptTemplates[0]!.id,
        templateName: mockPromptTemplates[0]!.name,
        templateVersion: 1,
        variables: {},
        systemPrompt: 'System A',
        userPrompt: 'User A',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PromptRunHistoryPage />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    const headings = screen.getAllByRole('heading', { level: 3 });

    expect(headings[0]).toHaveTextContent('API Design Partner');
    expect(headings[1]).toHaveTextContent('Code Review Assistant');
    expect(
      screen.getAllByRole('link', { name: 'View source template' })[0],
    ).toHaveAttribute('href', `/prompts/${mockPromptTemplates[1]!.id}`);
    expect(
      screen.getAllByRole('link', { name: 'Open output in Code Viewer' }),
    ).toHaveLength(2);
  });

  it('shows an empty state when no runs have been saved yet', () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository([]);

    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PromptRunHistoryPage />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('No saved runs yet')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open Prompt Playground' }),
    ).toHaveAttribute('href', '/playground');
  });
});
