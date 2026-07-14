import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryRouter,
  type InitialEntry,
  RouterProvider,
} from 'react-router-dom';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { exportPromptRunAsJson } from '@/features/prompt-runs/lib/prompt-run-export';
import {
  buildPromptRunDetailPath,
  createPromptRunDetailNavigationState,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { PromptRunDetailPage } from '@/features/prompt-runs/pages/prompt-run-detail-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';
import { formatPromptSections } from '@/lib/prompt-sections';

vi.mock('@/features/prompt-runs/lib/prompt-run-export', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/prompt-runs/lib/prompt-run-export')>();

  return {
    ...actual,
    exportPromptRunAsJson: vi.fn(),
  };
});

const exportPromptRunAsJsonMock = vi.mocked(exportPromptRunAsJson);

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

function createRunRepository(initialRuns: PromptRunRecord[]): PromptRunRepository {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
  };
}

function createNoteRepository(
  initialNotes: PromptRunNote[] = [],
): PromptRunNoteRepository & { snapshot: () => PromptRunNote[] } {
  let notes = [...initialNotes];

  return {
    loadAll: () => [...notes],
    saveAll: (nextNotes) => {
      notes = [...nextNotes];
    },
    snapshot: () => [...notes],
  };
}

function ExternalRunDeleteButton({ runId }: { runId: string }) {
  const { deleteRun } = usePromptRuns();

  return (
    <button type="button" onClick={() => deleteRun(runId)}>
      Delete run externally
    </button>
  );
}

function renderRunDetail(
  initialEntry: InitialEntry,
  initialRuns: PromptRunRecord[],
  templateRepository = createTemplateRepository(),
  noteRepository = createNoteRepository(),
  runRepository = createRunRepository(initialRuns),
  externalDeleteRunId?: string,
) {
  const router = createMemoryRouter(
    [
      {
        path: '/runs/:runId',
        element: (
          <PromptTemplatesProvider repository={templateRepository}>
            <PromptRunsProvider repository={runRepository}>
              <PromptRunNotesProvider repository={noteRepository}>
                <PromptRunDetailPage />
                {externalDeleteRunId ? (
                  <ExternalRunDeleteButton runId={externalDeleteRunId} />
                ) : null}
              </PromptRunNotesProvider>
            </PromptRunsProvider>
          </PromptTemplatesProvider>
        ),
      },
      {
        path: '/runs',
        element: <div>Run History Destination</div>,
      },
      {
        path: '/json-tools',
        element: <div>JSON Tools Destination</div>,
      },
    ],
    { initialEntries: [initialEntry] },
  );

  render(<RouterProvider router={router} />);

  return {
    noteRepository,
    router,
    runRepository,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('PromptRunDetailPage', () => {
  it('shows a saved run with variables, prompts, and source template link', () => {
    renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
        templateVersion: starterPromptTemplates[0]!.version,
        variables: { repository_name: 'dev-ai-toolkit' },
        systemPrompt: 'Review the code carefully.',
        userPrompt: 'Focus on bugs and missing tests.',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Saved prompt snapshot')).toBeInTheDocument();
    expect(screen.getByText('Snapshot content')).toBeInTheDocument();
    expect(screen.getByText('repository_name')).toBeInTheDocument();
    expect(screen.getByText('dev-ai-toolkit')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open variables in JSON Tools' }),
    ).toHaveAttribute('href', '/json-tools?runId=run-1');
    expect(screen.getByText('Review the code carefully.')).toBeInTheDocument();
    expect(
      screen.getByText('Focus on bugs and missing tests.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View source template' }),
    ).toHaveAttribute('href', `/prompts/${starterPromptTemplates[0]!.id}`);
    expect(
      screen.getByRole('link', { name: 'Reopen in Playground' }),
    ).toHaveAttribute(
      'href',
      `/playground?runId=run-1&templateId=${starterPromptTemplates[0]!.id}`,
    );
    const codeViewerUrl = new URL(
      screen
        .getByRole('link', { name: 'Open saved prompts in Code Viewer' })
        .getAttribute('href') ?? '',
      'https://example.test',
    );

    expect(codeViewerUrl.pathname).toBe('/code-viewer');
    expect(codeViewerUrl.searchParams.get('runId')).toBe('run-1');
    expect(codeViewerUrl.searchParams.has('left')).toBe(false);
    expect(codeViewerUrl.searchParams.has('right')).toBe(false);
    expect(
      screen.getByRole('link', { name: 'Compare with source' }),
    ).toHaveAttribute('href', '/prompt-diff?runId=run-1');
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Saved prompts',
      'Run inputs',
      'Maintenance note',
      'Snapshot management',
    ]);
  });

  it('returns to the filtered Run History path that opened the detail', async () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const historyPath = `/runs?templateId=${run.templateId}&q=System`;
    const { router } = renderRunDetail(
      {
        pathname: '/runs/run-1',
        state: createPromptRunDetailNavigationState(historyPath),
      },
      [run],
    );

    fireEvent.click(screen.getByRole('link', { name: 'Back to Run History' }));

    expect(await screen.findByText('Run History Destination')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/runs');
    expect(router.state.location.search).toBe(
      `?templateId=${run.templateId}&q=System`,
    );
  });

  it('passes the Run History return path into JSON Tools', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: { repository_name: 'dev-ai-toolkit' },
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const historyPath = `/runs?templateId=${run.templateId}&q=toolkit`;
    const { router } = renderRunDetail(
      {
        pathname: '/runs/run-1',
        state: createPromptRunDetailNavigationState(historyPath),
      },
      [run],
    );

    fireEvent.click(
      screen.getByRole('link', { name: 'Open variables in JSON Tools' }),
    );

    expect(screen.getByText('JSON Tools Destination')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?runId=run-1');
    expect(router.state.location.state).toEqual(
      createPromptRunDetailNavigationState(historyPath),
    );
  });

  it('opens a run whose ID contains URL-sensitive characters', () => {
    const run: PromptRunRecord = {
      id: 'imported/run #1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'Imported system prompt.',
      userPrompt: 'Imported user prompt.',
      createdAt: '2026-05-07T09:00:00.000Z',
    };

    renderRunDetail(buildPromptRunDetailPath(run.id), [run]);

    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Imported system prompt.')).toBeInTheDocument();
    expect(screen.getByText('Imported user prompt.')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Create template from snapshot' }),
    ).toHaveAttribute('href', '/create-template?runId=imported%2Frun%20%231');
    expect(
      screen.queryByRole('link', { name: 'Open variables in JSON Tools' }),
    ).not.toBeInTheDocument();
  });

  it('encodes an imported source template ID in its detail link', () => {
    const template = {
      ...starterPromptTemplates[0]!,
      id: 'imported/template #1',
    };
    const run: PromptRunRecord = {
      id: 'run-with-imported-template',
      templateId: template.id,
      templateName: template.name,
      templateVersion: template.version,
      variables: {},
      systemPrompt: template.systemPrompt,
      userPrompt: template.userPrompt,
      createdAt: '2026-05-07T09:00:00.000Z',
    };

    renderRunDetail(
      buildPromptRunDetailPath(run.id),
      [run],
      createTemplateRepository([template]),
    );

    expect(
      screen.getByRole('link', { name: 'View source template' }),
    ).toHaveAttribute('href', '/prompts/imported%2Ftemplate%20%231');
  });

  it('saves a maintenance note for the current run', () => {
    const { noteRepository } = renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
        templateVersion: starterPromptTemplates[0]!.version,
        variables: {},
        systemPrompt: 'System',
        userPrompt: 'User',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Good baseline for future review prompts.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(screen.getByText('Note saved.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Note saved.');
    expect(noteRepository.snapshot()[0]).toMatchObject({
      runId: 'run-1',
      body: 'Good baseline for future review prompts.',
    });
  });

  it('copies a saved prompt from the run detail', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
        templateVersion: starterPromptTemplates[0]!.version,
        variables: {},
        systemPrompt: 'System prompt to reuse.',
        userPrompt: 'User prompt to reuse.',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy system prompt' }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('System prompt to reuse.');
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'System prompt copied.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy full prompt' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenLastCalledWith(
        formatPromptSections({
          systemPrompt: 'System prompt to reuse.',
          userPrompt: 'User prompt to reuse.',
        }),
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'Full prompt copied.',
      );
    });
  });

  it('announces when a full saved prompt cannot be copied', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
        templateVersion: starterPromptTemplates[0]!.version,
        variables: {},
        systemPrompt: 'System prompt.',
        userPrompt: 'User prompt.',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Copy full prompt' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to copy full prompt.',
    );
  });

  it('compares a saved run with the matching source template revision', () => {
    const template: PromptTemplate = {
      id: 'review-template',
      name: 'Review Template',
      description: 'Review code changes.',
      systemPrompt: 'Current system prompt v2.',
      userPrompt: 'Current user prompt v2.',
      tags: ['review'],
      version: 2,
      revisions: [
        {
          version: 1,
          updatedAt: '2026-05-06T09:00:00.000Z',
          name: 'Review Template',
          description: 'Review code changes.',
          systemPrompt: 'Original system prompt v1.',
          userPrompt: 'Original user prompt v1.',
          tags: ['review'],
        },
        {
          version: 2,
          updatedAt: '2026-05-07T09:00:00.000Z',
          name: 'Review Template',
          description: 'Review code changes.',
          systemPrompt: 'Current system prompt v2.',
          userPrompt: 'Current user prompt v2.',
          tags: ['review'],
        },
      ],
      archivedAt: null,
      updatedAt: '2026-05-07T09:00:00.000Z',
    };

    renderRunDetail(
      '/runs/run-1',
      [
        {
          id: 'run-1',
          templateId: template.id,
          templateName: template.name,
          templateVersion: 1,
          variables: {},
          systemPrompt: 'Generated system prompt.',
          userPrompt: 'Generated user prompt.',
          createdAt: '2026-05-08T09:00:00.000Z',
        },
      ],
      createTemplateRepository([template]),
    );

    const compareUrl = new URL(
      screen.getByRole('link', { name: 'Compare with source' }).getAttribute(
        'href',
      ) ?? '',
      'https://example.test',
    );

    expect(compareUrl.searchParams.get('runId')).toBe('run-1');
    expect(compareUrl.searchParams.has('left')).toBe(false);
    expect(compareUrl.searchParams.has('right')).toBe(false);
  });

  it('explains when the saved source revision is no longer available', () => {
    const baseTemplate = starterPromptTemplates[0]!;
    const currentRevision = {
      ...baseTemplate.revisions[0]!,
      version: 2,
      updatedAt: '2026-05-07T09:00:00.000Z',
    };
    const template: PromptTemplate = {
      ...baseTemplate,
      version: currentRevision.version,
      updatedAt: currentRevision.updatedAt,
      revisions: [currentRevision],
    };

    renderRunDetail(
      '/runs/run-1',
      [
        {
          id: 'run-1',
          templateId: template.id,
          templateName: template.name,
          templateVersion: 1,
          variables: {},
          systemPrompt: 'Saved system prompt.',
          userPrompt: 'Saved user prompt.',
          createdAt: '2026-05-08T09:00:00.000Z',
        },
      ],
      createTemplateRepository([template]),
    );

    expect(
      screen.queryByRole('link', { name: 'Compare with source' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Template v1 is no longer available in local revision history, so source comparison is unavailable.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View source template' }),
    ).toHaveAttribute('href', `/prompts/${template.id}`);
  });

  it('exports the current run with saved note context', () => {
    const sourceTemplateRevision = starterPromptTemplates[0]!.revisions[0]!;
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: sourceTemplateRevision.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const note: PromptRunNote = {
      id: 'note-1',
      runId: 'run-1',
      body: 'Good baseline for future review prompts.',
      createdAt: '2026-05-08T09:00:00.000Z',
      updatedAt: '2026-05-08T09:00:00.000Z',
    };

    renderRunDetail(
      '/runs/run-1',
      [run],
      createTemplateRepository(),
      createNoteRepository([note]),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export run JSON' }));

    expect(exportPromptRunAsJsonMock).toHaveBeenCalledWith({
      run,
      note,
      sourceTemplateRevision,
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Run exported as JSON.',
    );
  });

  it('reports a failed run export and allows retrying', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };

    exportPromptRunAsJsonMock
      .mockImplementationOnce(() => {
        throw new Error('Downloads are unavailable.');
      })
      .mockImplementationOnce(() => undefined);
    renderRunDetail('/runs/run-1', [run]);

    fireEvent.click(screen.getByRole('button', { name: 'Export run JSON' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to export this run as JSON. Please try again.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export run JSON' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Run exported as JSON.',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('protects an unsaved note draft during navigation', async () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };

    renderRunDetail('/runs/run-1', [run]);

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Keep this draft visible.' },
    });

    const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(beforeUnloadEvent);

    expect(beforeUnloadEvent.defaultPrevented).toBe(true);

    fireEvent.click(screen.getByRole('link', { name: 'Back to Run History' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Discard unsaved note changes?',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue editing' }),
    ).toHaveFocus();

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue editing' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Note')).toHaveValue(
      'Keep this draft visible.',
    );

    fireEvent.click(screen.getByRole('link', { name: 'Back to Run History' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Discard draft' }),
    );

    expect(await screen.findByText('Run History Destination')).toBeInTheDocument();
  });

  it('shows the missing state when a clean run is deleted externally', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };

    const historyPath = `/runs?templateId=${run.templateId}&q=System`;

    renderRunDetail(
      {
        pathname: '/runs/run-1',
        state: createPromptRunDetailNavigationState(historyPath),
      },
      [run],
      createTemplateRepository(),
      createNoteRepository(),
      createRunRepository([run]),
      run.id,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Delete run externally' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Run not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Run History' }),
    ).toHaveAttribute('href', historyPath);
    expect(screen.queryByLabelText('Note')).not.toBeInTheDocument();
  });

  it('restores a deleted run with its unsaved note draft', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const runRepository = createRunRepository([run]);
    const noteRepository = createNoteRepository();
    const historyPath = `/runs?templateId=${run.templateId}&q=System`;
    const { router } = renderRunDetail(
      {
        pathname: '/runs/run-1',
        state: createPromptRunDetailNavigationState(historyPath),
      },
      [run],
      createTemplateRepository(),
      noteRepository,
      runRepository,
      run.id,
    );

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Keep this deleted-run draft.' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete run externally' }),
    );

    expect(screen.getByLabelText('Note')).toHaveValue(
      'Keep this deleted-run draft.',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved prompt snapshot was deleted in another tab. Your unsaved note is still here. Restore both as a new snapshot to keep the draft.',
    );
    expect(screen.getByRole('button', { name: 'Save note' })).toBeDisabled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Restore snapshot and note' }),
    );

    const restoredRun = runRepository.loadAll()[0];

    expect(restoredRun?.id).not.toBe(run.id);
    expect(router.state.location.pathname).toBe(
      buildPromptRunDetailPath(restoredRun!.id),
    );
    expect(router.state.location.state).toEqual(
      createPromptRunDetailNavigationState(historyPath),
    );
    expect(noteRepository.snapshot()[0]).toMatchObject({
      runId: restoredRun?.id,
      body: 'Keep this deleted-run draft.',
    });
    expect(screen.getByLabelText('Note')).toHaveValue(
      'Keep this deleted-run draft.',
    );
    expect(screen.getByRole('button', { name: 'Save note' })).toBeEnabled();
  });

  it('keeps a deleted-run note draft when restoration fails', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const runRepository = createRunRepository([run]);
    const noteRepository: PromptRunNoteRepository & {
      snapshot: () => PromptRunNote[];
    } = {
      loadAll: () => [],
      saveAll: () => {
        throw new Error('Note storage failed.');
      },
      snapshot: () => [],
    };

    renderRunDetail(
      '/runs/run-1',
      [run],
      createTemplateRepository(),
      noteRepository,
      runRepository,
      run.id,
    );

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Keep this failed-restore draft.' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete run externally' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Restore snapshot and note' }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to restore this snapshot and note. No replacement was kept.',
    );
    expect(screen.getByLabelText('Note')).toHaveValue(
      'Keep this failed-restore draft.',
    );
    expect(screen.getByRole('button', { name: 'Save note' })).toBeDisabled();
    expect(runRepository.loadAll()).toEqual([]);
    expect(noteRepository.snapshot()).toEqual([]);
  });

  it('asks for confirmation before deleting the current run and its saved note', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const runRepository = createRunRepository([run]);
    const noteRepository = createNoteRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Good baseline for future review prompts.',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);
    const historyPath = `/runs?templateId=${run.templateId}&q=System`;

    const { router } = renderRunDetail(
      {
        pathname: '/runs/run-1',
        state: createPromptRunDetailNavigationState(historyPath),
      },
      [run],
      createTemplateRepository(),
      noteRepository,
      runRepository,
    );

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Unsaved replacement note.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete run' }));

    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(
      'The unsaved note draft will also be discarded.',
    );
    expect(runRepository.loadAll()).toHaveLength(1);
    expect(noteRepository.snapshot()).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByText('Run History Destination')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/runs');
    expect(router.state.location.search).toBe(
      `?templateId=${run.templateId}&q=System`,
    );
    expect(runRepository.loadAll()).toEqual([]);
    expect(noteRepository.snapshot()).toEqual([]);
  });

  it('keeps the run detail open when browser storage rejects deletion', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const runRepository: PromptRunRepository = {
      loadAll: () => [run],
      saveAll: () => {
        throw new Error('Storage quota exceeded.');
      },
    };
    const noteRepository = createNoteRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Keep this note after a failed delete.',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    renderRunDetail(
      '/runs/run-1',
      [run],
      createTemplateRepository(),
      noteRepository,
      runRepository,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete run' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to delete this prompt snapshot. Check that browser storage is available and try again.',
    );
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(noteRepository.snapshot()).toHaveLength(1);
    expect(
      screen.queryByText('Run History Destination'),
    ).not.toBeInTheDocument();
  });

  it('warns when a failed run deletion also loses its note rollback', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: starterPromptTemplates[0]!.version,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const note: PromptRunNote = {
      id: 'note-1',
      runId: run.id,
      body: 'This note cannot be restored.',
      createdAt: '2026-05-08T09:00:00.000Z',
      updatedAt: '2026-05-08T09:00:00.000Z',
    };
    const runRepository: PromptRunRepository = {
      loadAll: () => [run],
      saveAll: () => {
        throw new Error('Run deletion failed.');
      },
    };
    let notes = [note];
    const noteRepository: PromptRunNoteRepository & {
      snapshot: () => PromptRunNote[];
    } = {
      loadAll: () => [...notes],
      saveAll: (nextNotes) => {
        if (nextNotes.length > 0) {
          throw new Error('Note rollback failed.');
        }

        notes = [...nextNotes];
      },
      snapshot: () => [...notes],
    };

    renderRunDetail(
      '/runs/run-1',
      [run],
      createTemplateRepository(),
      noteRepository,
      runRepository,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete run' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The snapshot remains in Run History, but the note may be missing.',
    );
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
  });

  it('shows a not-found state when the run is missing', () => {
    renderRunDetail('/runs/missing-run', []);

    expect(screen.getByText('Run not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Run History' }),
    ).toHaveAttribute('href', '/runs');
  });

  it('does not reopen a run when its source template is archived', () => {
    const archivedTemplate: PromptTemplate = {
      ...starterPromptTemplates[0]!,
      archivedAt: '2026-05-08T09:00:00.000Z',
    };

    renderRunDetail(
      '/runs/run-1',
      [
        {
          id: 'run-1',
          templateId: archivedTemplate.id,
          templateName: archivedTemplate.name,
          templateVersion: archivedTemplate.version,
          variables: {},
          systemPrompt: 'System prompt.',
          userPrompt: 'User prompt.',
          createdAt: '2026-05-07T09:00:00.000Z',
        },
      ],
      createTemplateRepository([archivedTemplate]),
    );

    expect(
      screen.queryByRole('link', { name: 'Reopen in Playground' }),
    ).not.toBeInTheDocument();
  });
});
