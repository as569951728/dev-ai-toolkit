import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { PromptPlaygroundPage } from '@/features/prompt-playground/pages/prompt-playground-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';
import { formatPromptSections } from '@/lib/prompt-sections';

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

function renderPlayground(
  initialEntry: string,
  templateRepository = createTemplateRepository(),
  runRepository = createRunRepository(),
) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={templateRepository}>
        <PromptRunsProvider repository={runRepository}>
          <PlaygroundWorkflowProbe />
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Prompt playground workflow', () => {
  it('surfaces unresolved variables until all prompt inputs are filled', () => {
    render(
      <MemoryRouter initialEntries={['/playground']}>
        <PromptTemplatesProvider repository={createTemplateRepository()}>
          <PromptRunsProvider repository={createRunRepository()}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        '2 template variables are unresolved. Their placeholders will remain in copied and saved prompts. Missing: Repository Name, Change Scope.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Repository Name'), {
      target: { value: 'dev-ai-toolkit' },
    });

    expect(
      screen.getByText(
        '1 template variable is unresolved. Its placeholder will remain in copied and saved prompts. Missing: Change Scope.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Change Scope'), {
      target: { value: 'frontend workflow' },
    });

    expect(
      screen.queryByText(/template variable is unresolved/),
    ).not.toBeInTheDocument();
  });

  it('composes templates with dotted variable names', () => {
    const dottedTemplate = {
      ...starterPromptTemplates[0]!,
      id: 'pull-request-review',
      name: 'Pull Request Review',
      systemPrompt: 'Review {{pull_request.title}} carefully.',
      userPrompt: 'Focus on {{pull_request.change_scope}}.',
    };

    render(
      <MemoryRouter initialEntries={['/playground']}>
        <PromptTemplatesProvider
          repository={createTemplateRepository([dottedTemplate])}
        >
          <PromptRunsProvider repository={createRunRepository()}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Pull Request Title'), {
      target: { value: 'Preserve prompt context' },
    });
    fireEvent.change(screen.getByLabelText('Pull Request Change Scope'), {
      target: { value: 'storage regressions' },
    });

    expect(
      screen.getByText('Review Preserve prompt context carefully.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Focus on storage regressions.'),
    ).toBeInTheDocument();
  });

  it('discloses when a linked template is missing and names the fallback', () => {
    render(
      <MemoryRouter initialEntries={['/playground?templateId=missing-template']}>
        <PromptTemplatesProvider repository={createTemplateRepository()}>
          <PromptRunsProvider repository={createRunRepository()}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The requested prompt template is not available in this browser. Showing Code Review Assistant instead.',
    );
    expect(screen.getByLabelText('Active template')).toHaveValue(
      starterPromptTemplates[0]!.id,
    );
  });

  it('discloses when a linked template is archived and names the fallback', () => {
    const archivedTemplate = {
      ...starterPromptTemplates[0]!,
      archivedAt: '2026-05-08T09:00:00.000Z',
    };
    const activeTemplate = starterPromptTemplates[1]!;

    render(
      <MemoryRouter
        initialEntries={[
          `/playground?templateId=${archivedTemplate.id}`,
        ]}
      >
        <PromptTemplatesProvider
          repository={createTemplateRepository([
            archivedTemplate,
            activeTemplate,
          ])}
        >
          <PromptRunsProvider repository={createRunRepository()}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      `The requested prompt template is archived. Showing ${activeTemplate.name} instead.`,
    );
    expect(screen.getByLabelText('Active template')).toHaveValue(
      activeTemplate.id,
    );
  });

  it('discloses a missing saved run and uses a requested fallback template', () => {
    const fallbackTemplate = starterPromptTemplates[1]!;

    renderPlayground(
      `/playground?runId=missing-run&templateId=${fallbackTemplate.id}`,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      `The requested prompt snapshot is not available in this browser. Showing ${fallbackTemplate.name} instead.`,
    );
    expect(screen.getByLabelText('Active template')).toHaveValue(
      fallbackTemplate.id,
    );
  });

  it('discloses when a saved run source template is missing', () => {
    const run: PromptRunRecord = {
      id: 'orphaned-run',
      templateId: 'deleted-template',
      templateName: 'Deleted Template',
      templateVersion: 1,
      variables: {},
      systemPrompt: 'Saved system prompt.',
      userPrompt: 'Saved user prompt.',
      createdAt: '2026-05-08T09:00:00.000Z',
    };

    renderPlayground(
      '/playground?runId=orphaned-run',
      createTemplateRepository(),
      createRunRepository([run]),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The requested prompt snapshot cannot be reopened because its source template is not available. Showing Code Review Assistant instead.',
    );
    expect(screen.getByLabelText('Active template')).toHaveValue(
      starterPromptTemplates[0]!.id,
    );
  });

  it('discloses when a saved run source template is archived', () => {
    const archivedTemplate = {
      ...starterPromptTemplates[0]!,
      archivedAt: '2026-05-08T09:00:00.000Z',
    };
    const fallbackTemplate = starterPromptTemplates[1]!;
    const run: PromptRunRecord = {
      id: 'archived-template-run',
      templateId: archivedTemplate.id,
      templateName: archivedTemplate.name,
      templateVersion: archivedTemplate.version,
      variables: {},
      systemPrompt: 'Saved system prompt.',
      userPrompt: 'Saved user prompt.',
      createdAt: '2026-05-08T09:00:00.000Z',
    };

    renderPlayground(
      '/playground?runId=archived-template-run',
      createTemplateRepository([archivedTemplate, fallbackTemplate]),
      createRunRepository([run]),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      `The requested prompt snapshot cannot be reopened because its source template is archived. Showing ${fallbackTemplate.name} instead.`,
    );
    expect(screen.getByLabelText('Active template')).toHaveValue(
      fallbackTemplate.id,
    );
  });

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

    fireEvent.click(screen.getByRole('button', { name: 'Save prompt snapshot' }));

    expect(
      await screen.findByText(
        'Saved a prompt snapshot for Code Review Assistant v1.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved a prompt snapshot for Code Review Assistant v1.',
    );
    expect(
      screen.getByRole('link', { name: 'Open saved run' }).getAttribute('href'),
    ).toMatch(/^\/runs\/.+/);
    expect(
      screen.getByText('Next: review it, add a note, or browse history.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse run history' }),
    ).toHaveAttribute('href', '/runs');
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

  it('reports when browser storage rejects a prompt snapshot', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository: PromptRunRepository = {
      loadAll: () => [],
      saveAll: () => {
        throw new Error('Storage quota exceeded.');
      },
    };
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

    fireEvent.click(screen.getByRole('button', { name: 'Save prompt snapshot' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to save this prompt snapshot. Check that browser storage is available and try again.',
    );
    expect(
      screen.queryByRole('link', { name: 'Open saved run' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Recently used')).not.toBeInTheDocument();
  });

  it('keeps the core workflow usable when recent template storage fails', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const nextTemplate = starterPromptTemplates[1]!;

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded.');
    });

    render(
      <MemoryRouter initialEntries={['/playground']}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Active template'), {
      target: { value: nextTemplate.id },
    });

    expect(screen.getByLabelText('Active template')).toHaveValue(
      nextTemplate.id,
    );
    expect(screen.getByText('Recently used')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save prompt snapshot' }));

    expect(
      await screen.findByText(
        `Saved a prompt snapshot for ${nextTemplate.name} v${nextTemplate.version}.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open saved run' }),
    ).toBeInTheDocument();
  });

  it('opens composed prompts in downstream review tools', () => {
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

    expect(
      screen.getByRole('heading', { name: 'Composed prompt preview' }),
    ).toBeInTheDocument();

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

  it('reopens a saved run with its captured variables', () => {
    const templateRepository = createTemplateRepository();
    const template = starterPromptTemplates[0]!;
    const runRepository = createRunRepository([
      {
        id: 'run-1',
        templateId: template.id,
        templateName: template.name,
        templateVersion: template.version,
        variables: {
          repository_name: 'dev-ai-toolkit',
          change_scope: 'saved workflow review',
        },
        systemPrompt: 'Saved system prompt.',
        userPrompt: 'Saved user prompt.',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    render(
      <MemoryRouter initialEntries={['/playground?runId=run-1']}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Active template')).toHaveValue(template.id);
    expect(screen.getByLabelText('Repository Name')).toHaveValue(
      'dev-ai-toolkit',
    );
    expect(screen.getByLabelText('Change Scope')).toHaveValue(
      'saved workflow review',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Changes here will create a new snapshot and leave the original unchanged.',
    );
    expect(
      screen.getByRole('link', { name: 'saved prompt snapshot' }),
    ).toHaveAttribute('href', '/runs/run-1');
  });

  it('copies generated prompt sections and announces the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = starterPromptTemplates[0]!.id;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]!);

    expect(writeText).toHaveBeenCalledWith(
      starterPromptTemplates[0]!.systemPrompt,
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'System prompt copied.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy full prompt' }));

    expect(writeText).toHaveBeenLastCalledWith(
      formatPromptSections({
        systemPrompt: starterPromptTemplates[0]!.systemPrompt,
        userPrompt: starterPromptTemplates[0]!.userPrompt,
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Full prompt copied.',
    );

    fireEvent.change(screen.getByLabelText('Repository Name'), {
      target: { value: 'updated-repository' },
    });

    expect(screen.queryByText('Full prompt copied.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy full prompt' }),
    ).toBeInTheDocument();
  });

  it('announces full prompt copy failures when the clipboard is unavailable', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const templateId = starterPromptTemplates[0]!.id;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    render(
      <MemoryRouter initialEntries={[`/playground?templateId=${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={runRepository}>
            <PlaygroundWorkflowProbe />
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy full prompt' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to copy full prompt.',
    );
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

    fireEvent.click(screen.getByRole('button', { name: 'Save prompt snapshot' }));

    expect(
      await screen.findByText(
        'Saved a prompt snapshot for Code Review Assistant v1.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Active template'), {
      target: { value: starterPromptTemplates[1]!.id },
    });

    expect(
      screen.queryByText('Saved a prompt snapshot for Code Review Assistant v1.'),
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

    fireEvent.click(screen.getByRole('button', { name: 'Save prompt snapshot' }));

    expect(
      await screen.findByText(
        'Saved a prompt snapshot for Code Review Assistant v1.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Repository Name'), {
      target: { value: 'different-repo' },
    });

    expect(
      screen.queryByText('Saved a prompt snapshot for Code Review Assistant v1.'),
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
