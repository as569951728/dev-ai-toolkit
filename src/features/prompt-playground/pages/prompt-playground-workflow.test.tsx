import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PromptPlaygroundPage } from '@/features/prompt-playground/pages/prompt-playground-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';

function createTemplateRepository(
  initialTemplates = starterPromptTemplates,
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

function LocationProbe() {
  const location = useLocation();

  return (
    <>
      <div data-testid="location-pathname">{location.pathname}</div>
      <div data-testid="location-search">{location.search}</div>
    </>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('Prompt playground workflow', () => {
  it('saves a run snapshot and exposes it in template history', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = starterPromptTemplates[0]!.id;

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
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved a run snapshot for Code Review Assistant v1.',
    );
    expect(
      screen.getByRole('link', { name: 'Open saved run' }).getAttribute('href'),
    ).toMatch(/^\/runs\/.+/);
    expect(screen.getByText('Recently used')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Code Review Assistant/ }),
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

  it('opens generated prompt output in downstream review tools', () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = starterPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <Routes>
              <Route path="/playground" element={<PromptPlaygroundPage />} />
              <Route path="/prompt-diff" element={<LocationProbe />} />
              <Route path="/code-viewer" element={<LocationProbe />} />
            </Routes>
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
    fireEvent.click(screen.getByRole('button', { name: 'Review in Prompt Diff' }));

    const promptDiffParams = new URLSearchParams(
      screen.getByTestId('location-search').textContent ?? '',
    );

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/prompt-diff',
    );
    expect(promptDiffParams.get('left')).toContain('{{repository_name}}');
    expect(promptDiffParams.get('right')).toContain('dev-ai-toolkit');

    cleanup();

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <Routes>
              <Route path="/playground" element={<PromptPlaygroundPage />} />
              <Route path="/code-viewer" element={<LocationProbe />} />
            </Routes>
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
    fireEvent.click(screen.getByRole('button', { name: 'Open in Code Viewer' }));

    const codeViewerParams = new URLSearchParams(
      screen.getByTestId('location-search').textContent ?? '',
    );

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/code-viewer',
    );
    expect(codeViewerParams.get('right')).toContain('frontend workflow');
    expect(codeViewerParams.get('mode')).toBe('compare');
    expect(codeViewerParams.get('language')).toBe('markdown');
  });

  it('clears the save status when the active template changes', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = starterPromptTemplates[0]!.id;

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
      target: { value: starterPromptTemplates[1]!.id },
    });

    expect(
      screen.queryByText('Saved a run snapshot for Code Review Assistant v1.'),
    ).not.toBeInTheDocument();
  });

  it('clears the save status when the preview content changes', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = starterPromptTemplates[0]!.id;

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

  it('falls back to the first template when the URL template id is missing', () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const fallbackTemplateId = starterPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={['/playground?templateId=missing-template']}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Active template')).toHaveValue(
      fallbackTemplateId,
    );
  });

  it('shows an empty state when no active templates are available', () => {
    const archivedTemplate = {
      ...starterPromptTemplates[0]!,
      archivedAt: '2026-05-07T08:00:00.000Z',
    };
    const templateRepository = createTemplateRepository([archivedTemplate]);
    const runRepository = createRunRepository();

    render(
      <MemoryRouter initialEntries={['/playground']}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText('No active templates available'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Active template')).not.toBeInTheDocument();
  });
});
