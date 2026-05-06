import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PromptPlaygroundPage } from '@/features/prompt-playground/pages/prompt-playground-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';

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

function PlaygroundWorkflowProbe() {
  const { templates } = usePromptTemplates();
  const template = templates[0]!;

  return (
    <Routes>
      <Route path="/playground" element={<PromptPlaygroundPage />} />
      <Route path="/prompts/:promptId" element={<PromptTemplateDetailPage />} />
      <Route
        path="*"
        element={<div data-testid="template-id">{template.id}</div>}
      />
    </Routes>
  );
}

afterEach(() => {
  cleanup();
});

describe('Prompt playground workflow', () => {
  it('saves a run snapshot and exposes it in template history', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = mockPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Repository Name'), {
      target: { value: 'dev-ai-toolkit' },
    });
    fireEvent.change(screen.getByLabelText('Change Scope'), {
      target: { value: 'frontend workflow' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save run snapshot' }));

    expect(
      await screen.findByText(
        'Saved a run snapshot for Code Review Assistant v1.',
      ),
    ).toBeInTheDocument();

    cleanup();

    render(
      <MemoryRouter initialEntries={[`/prompts/${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <Routes>
              <Route path="/prompts/:promptId" element={<PromptTemplateDetailPage />} />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Recent run history')).toBeInTheDocument();
    expect(await screen.findByText('Run from v1')).toBeInTheDocument();
  });

  it('clears the save status when the active template changes', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = mockPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save run snapshot' }));

    expect(
      await screen.findByText(
        'Saved a run snapshot for Code Review Assistant v1.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Active template'), {
      target: { value: mockPromptTemplates[1]!.id },
    });

    expect(
      screen.queryByText('Saved a run snapshot for Code Review Assistant v1.'),
    ).not.toBeInTheDocument();
  });

  it('clears the save status when the preview content changes', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = mockPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Repository Name'), {
      target: { value: 'dev-ai-toolkit' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save run snapshot' }));

    expect(
      await screen.findByText(
        'Saved a run snapshot for Code Review Assistant v1.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Repository Name'), {
      target: { value: 'different-repo' },
    });

    expect(
      screen.queryByText('Saved a run snapshot for Code Review Assistant v1.'),
    ).not.toBeInTheDocument();
  });
});
