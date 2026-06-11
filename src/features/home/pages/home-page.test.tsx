import { cleanup, render, screen } from '@testing-library/react';
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

function renderHomePage() {
  render(
    <MemoryRouter>
      <PromptTemplatesProvider repository={createTemplateRepository()}>
        <PromptRunsProvider repository={createRunRepository()}>
          <HomePage />
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe('HomePage', () => {
  it('describes API Builder outputs consistently with the current module', () => {
    renderHomePage();

    expect(
      screen.getByText(
        'Compose request URLs, headers, query params, and payloads, then generate fetch snippets or cURL commands.',
      ),
    ).toBeInTheDocument();
  });
});
