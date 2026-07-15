import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { HomePage } from '@/features/home/pages/home-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

function createTemplateRepository(
  initialTemplates: PromptTemplate[] = starterPromptTemplates,
): PromptTemplateRepository {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
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

function renderHomePage({
  runs = [],
  templates = starterPromptTemplates,
}: {
  runs?: PromptRunRecord[];
  templates?: PromptTemplate[];
} = {}) {
  render(
    <MemoryRouter>
      <PromptTemplatesProvider repository={createTemplateRepository(templates)}>
        <PromptRunsProvider repository={createRunRepository(runs)}>
          <HomePage />
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );
}

function getActiveTemplateMetric() {
  const metric = screen.getByText('Active templates').closest('.metric-card');

  if (!(metric instanceof HTMLElement)) {
    throw new Error('Expected the active-template metric card.');
  }

  return within(metric);
}

afterEach(() => {
  cleanup();
});

describe('HomePage', () => {
  it('presents prompt snapshots as the primary workflow', () => {
    renderHomePage();

    expect(
      screen.getByRole('heading', {
        name: 'Start with templates, then compose and review prompt snapshots.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Template to Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Prompt workflow foundation')).toBeInTheDocument();
  });

  it('opens the first active template from the primary action', () => {
    renderHomePage({
      templates: [
        {
          ...starterPromptTemplates[0]!,
          archivedAt: '2026-05-08T09:00:00.000Z',
          updatedAt: '2026-05-08T09:00:00.000Z',
        },
        starterPromptTemplates[1]!,
      ],
    });

    expect(
      screen.getByRole('link', { name: 'Open API Design Partner' }),
    ).toHaveAttribute('href', '/playground?templateId=api-design-partner');
    expect(
      screen.getByRole('link', { name: 'Manage prompt templates' }),
    ).toHaveAttribute('href', '/prompts');
    expect(getActiveTemplateMetric().getByText('1')).toBeInTheDocument();
  });

  it('offers template creation when no active template is available', () => {
    renderHomePage({
      templates: starterPromptTemplates.map((template) => ({
        ...template,
        archivedAt: '2026-05-08T09:00:00.000Z',
      })),
    });

    expect(
      screen.getByRole('link', { name: 'Create first template' }),
    ).toHaveAttribute('href', '/create-template');
    expect(getActiveTemplateMetric().getByText('0')).toBeInTheDocument();
  });

  it('describes API Builder outputs consistently with the current module', () => {
    renderHomePage();

    expect(
      screen.getByText(
        'Compose request URLs, headers, query params, and payloads, then generate fetch snippets or cURL commands.',
      ),
    ).toBeInTheDocument();
  });

  it('links recent activity cards to the saved run detail page', () => {
    renderHomePage({
      runs: [
        {
          id: 'imported/run #1',
          templateId: 'code-review-assistant',
          templateName: 'Code Review Assistant',
          templateVersion: 2,
          variables: { repository_name: 'dev-ai-toolkit' },
          systemPrompt: 'System',
          userPrompt: 'User',
          createdAt: '2026-05-07T09:00:00.000Z',
        },
      ],
    });

    expect(
      screen.getByRole('link', { name: 'Open run detail' }),
    ).toHaveAttribute('href', '/runs/imported%2Frun%20%231');
  });
});
