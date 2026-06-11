import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { createPromptRunExportPayload } from '@/features/prompt-runs/lib/prompt-run-export';
import { PromptRunHistoryPage } from '@/features/prompt-runs/pages/prompt-run-history-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';

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
  initialRuns: PromptRunRecord[],
): PromptRunRepository & { snapshot: () => PromptRunRecord[] } {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
    snapshot: () => [...runs],
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

const sampleRuns: PromptRunRecord[] = [
  {
    id: 'run-2',
    templateId: starterPromptTemplates[1]!.id,
    templateName: starterPromptTemplates[1]!.name,
    templateVersion: 2,
    variables: { feature_name: 'run-history-page' },
    systemPrompt: 'System B',
    userPrompt: 'User B',
    createdAt: '2026-05-07T09:10:00.000Z',
  },
  {
    id: 'run-1',
    templateId: starterPromptTemplates[0]!.id,
    templateName: starterPromptTemplates[0]!.name,
    templateVersion: 1,
    variables: {},
    systemPrompt: 'System A',
    userPrompt: 'User A',
    createdAt: '2026-05-07T09:00:00.000Z',
  },
];

function renderRunHistory({
  initialEntry = '/',
  runs = sampleRuns,
  notes = [],
  templateRepository = createTemplateRepository(),
}: {
  initialEntry?: string;
  runs?: PromptRunRecord[];
  notes?: PromptRunNote[];
  templateRepository?: PromptTemplateRepository;
} = {}) {
  const runRepository = createRunRepository(runs);
  const noteRepository = createNoteRepository(notes);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={templateRepository}>
        <PromptRunsProvider repository={runRepository}>
          <PromptRunNotesProvider repository={noteRepository}>
            <PromptRunHistoryPage />
          </PromptRunNotesProvider>
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );

  return {
    noteRepository,
    runRepository,
  };
}

function RunHistoryNavigationHarness() {
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          navigate(`/runs?templateId=${starterPromptTemplates[1]!.id}`)
        }
      >
        Open API runs
      </button>
      <PromptRunHistoryPage />
    </>
  );
}

function renderNavigableRunHistory(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={createTemplateRepository()}>
        <PromptRunsProvider repository={createRunRepository(sampleRuns)}>
          <PromptRunNotesProvider repository={createNoteRepository()}>
            <RunHistoryNavigationHarness />
          </PromptRunNotesProvider>
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe('PromptRunHistoryPage', () => {
  it('lists saved runs and links back to the source template', () => {
    renderRunHistory();

    const headings = screen.getAllByRole('heading', { level: 3 });

    expect(headings[0]).toHaveTextContent('API Design Partner');
    expect(headings[1]).toHaveTextContent('Code Review Assistant');
    expect(
      screen.getAllByRole('link', { name: 'View source template' })[0],
    ).toHaveAttribute('href', `/prompts/${starterPromptTemplates[1]!.id}`);
    expect(
      screen.getAllByRole('link', { name: 'View details' })[0],
    ).toHaveAttribute('href', '/runs/run-2');
    expect(
      screen.getAllByRole('link', { name: 'Open output in Code Viewer' }),
    ).toHaveLength(2);
    expect(
      screen.getByText('Showing 2 of 2 saved runs.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('feature_name: run-history-page'),
    ).toBeInTheDocument();
  });

  it('summarizes captured variables when a run has several values', () => {
    renderRunHistory({
      runs: [
        {
          id: 'run-many-variables',
          templateId: starterPromptTemplates[1]!.id,
          templateName: starterPromptTemplates[1]!.name,
          templateVersion: 2,
          variables: {
            endpoint: '/v1/prompts',
            method: 'POST',
            repository_name: 'dev-ai-toolkit',
            change_scope: 'frontend',
          },
          systemPrompt: 'System',
          userPrompt: 'User',
          createdAt: '2026-05-07T09:10:00.000Z',
        },
      ],
    });

    expect(screen.getByText('endpoint: /v1/prompts')).toBeInTheDocument();
    expect(screen.getByText('method: POST')).toBeInTheDocument();
    expect(
      screen.getByText('repository_name: dev-ai-toolkit'),
    ).toBeInTheDocument();
    expect(screen.getByText('+1 more variable')).toBeInTheDocument();
  });

  it('shows an empty state when no runs have been saved yet', () => {
    renderRunHistory({ runs: [] });

    expect(screen.getByText('No saved runs yet')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open Prompt Playground' }),
    ).toHaveAttribute('href', '/playground');
  });

  it('imports a single prompt run JSON export with note context', async () => {
    const { noteRepository, runRepository } = renderRunHistory({ runs: [] });
    const importedRun: PromptRunRecord = {
      id: 'imported-run',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: 1,
      variables: { repository_name: 'dev-ai-toolkit' },
      systemPrompt: 'Imported system prompt.',
      userPrompt: 'Imported user prompt.',
      createdAt: '2026-05-10T09:00:00.000Z',
    };
    const importedNote: PromptRunNote = {
      id: 'note-imported-run',
      runId: importedRun.id,
      body: 'Imported note for later review.',
      createdAt: '2026-05-10T10:00:00.000Z',
      updatedAt: '2026-05-10T10:00:00.000Z',
    };
    const file = new File(
      [
        JSON.stringify(
          createPromptRunExportPayload({
            run: importedRun,
            note: importedNote,
            exportedAt: '2026-05-10T11:00:00.000Z',
          }),
        ),
      ],
      'prompt-run.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import run JSON'), {
      target: { files: [file] },
    });

    expect(await screen.findByText('Prompt run imported.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Imported Code Review Assistant from prompt-run.json.',
    );
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Imported note for later review.'),
    ).toBeInTheDocument();
    expect(runRepository.snapshot()).toEqual([importedRun]);
    expect(noteRepository.snapshot()).toEqual([importedNote]);
  });

  it('filters runs by template and template name search', () => {
    renderRunHistory();

    fireEvent.change(screen.getByLabelText('Search runs'), {
      target: { value: 'code review' },
    });

    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'API Design Partner' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Search: code review')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search runs'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Template'), {
      target: { value: starterPromptTemplates[1]!.id },
    });

    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Code Review Assistant' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Template: API Design Partner'),
    ).toBeInTheDocument();
  });

  it('deduplicates template filter options when saved runs keep older template names', () => {
    const templateId = starterPromptTemplates[0]!.id;

    renderRunHistory({
      runs: [
        {
          id: 'run-2',
          templateId,
          templateName: 'Older Code Review Name',
          templateVersion: 1,
          variables: {},
          systemPrompt: 'System B',
          userPrompt: 'User B',
          createdAt: '2026-05-07T09:10:00.000Z',
        },
        {
          id: 'run-1',
          templateId,
          templateName: starterPromptTemplates[0]!.name,
          templateVersion: 2,
          variables: {},
          systemPrompt: 'System A',
          userPrompt: 'User A',
          createdAt: '2026-05-07T09:00:00.000Z',
        },
      ],
    });

    const templateSelect = screen.getByLabelText('Template');
    const matchingOptions = Array.from(
      templateSelect.querySelectorAll(`option[value="${templateId}"]`),
    );

    expect(matchingOptions).toHaveLength(1);
    expect(matchingOptions[0]).toHaveTextContent(
      starterPromptTemplates[0]!.name,
    );
  });

  it('searches saved runs by note content', () => {
    renderRunHistory({
      notes: [
        {
          id: 'note-1',
          runId: 'run-2',
          body: 'Useful baseline for endpoint design review.',
          createdAt: '2026-05-08T02:00:00.000Z',
          updatedAt: '2026-05-08T02:00:00.000Z',
        },
      ],
    });

    fireEvent.change(screen.getByLabelText('Search runs'), {
      target: { value: 'endpoint design' },
    });

    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Code Review Assistant' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Note attached')).toBeInTheDocument();
    expect(
      screen.getByText('Useful baseline for endpoint design review.'),
    ).toBeInTheDocument();
  });

  it('searches saved runs by captured variable values', () => {
    renderRunHistory();

    fireEvent.change(screen.getByLabelText('Search runs'), {
      target: { value: 'run-history-page' },
    });

    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Code Review Assistant' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Search: run-history-page')).toBeInTheDocument();
  });

  it('searches saved runs by saved prompt text', () => {
    renderRunHistory();

    fireEvent.change(screen.getByLabelText('Search runs'), {
      target: { value: 'user b' },
    });

    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Code Review Assistant' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Search: user b')).toBeInTheDocument();
  });

  it('searches runs by the current source template name after a template rename', () => {
    renderRunHistory({
      runs: [
        {
          id: 'run-1',
          templateId: starterPromptTemplates[0]!.id,
          templateName: 'Older Review Name',
          templateVersion: 1,
          variables: {},
          systemPrompt: 'System A',
          userPrompt: 'User A',
          createdAt: '2026-05-07T09:00:00.000Z',
        },
      ],
    });

    fireEvent.change(screen.getByLabelText('Search runs'), {
      target: { value: 'code review' },
    });

    expect(
      screen.getByRole('heading', { name: 'Older Review Name' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 1 saved runs.')).toBeInTheDocument();
    expect(screen.getByText('Search: code review')).toBeInTheDocument();
  });

  it('preselects the template filter from the route query', () => {
    renderRunHistory({
      initialEntry: `/runs?templateId=${starterPromptTemplates[1]!.id}`,
    });

    expect(screen.getByLabelText('Template')).toHaveValue(
      starterPromptTemplates[1]!.id,
    );
    expect(
      screen.getByText('Showing 1 of 2 saved runs for API Design Partner.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Template: API Design Partner'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Code Review Assistant' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the selected template filter visible when that template has no runs yet', () => {
    renderRunHistory({
      initialEntry: `/runs?templateId=${starterPromptTemplates[1]!.id}`,
      runs: [
        {
          id: 'run-1',
          templateId: starterPromptTemplates[0]!.id,
          templateName: starterPromptTemplates[0]!.name,
          templateVersion: 1,
          variables: {},
          systemPrompt: 'System A',
          userPrompt: 'User A',
          createdAt: '2026-05-07T09:00:00.000Z',
        },
      ],
    });

    expect(screen.getByLabelText('Template')).toHaveValue(
      starterPromptTemplates[1]!.id,
    );
    expect(
      screen.getByText('Showing 0 of 1 saved runs for API Design Partner.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Template: API Design Partner'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No runs match the current filters'),
    ).toBeInTheDocument();
  });

  it('syncs active filters when the route query changes', () => {
    renderNavigableRunHistory(
      `/runs?templateId=${starterPromptTemplates[0]!.id}`,
    );

    expect(screen.getByLabelText('Template')).toHaveValue(
      starterPromptTemplates[0]!.id,
    );
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open API runs' }));

    expect(screen.getByLabelText('Template')).toHaveValue(
      starterPromptTemplates[1]!.id,
    );
    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Code Review Assistant' }),
    ).not.toBeInTheDocument();
  });

  it('preloads the search value from the route query', () => {
    renderRunHistory({ initialEntry: '/runs?q=code%20review' });

    expect(screen.getByLabelText('Search runs')).toHaveValue('code review');
    expect(screen.getByText('Search: code review')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'API Design Partner' }),
    ).not.toBeInTheDocument();
  });

  it('clears active filters and restores the full run list', () => {
    renderRunHistory({
      initialEntry: `/runs?templateId=${starterPromptTemplates[1]!.id}`,
    });

    expect(
      screen.getByRole('button', { name: 'Clear filters' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByLabelText('Template')).toHaveValue('all');
    expect(
      screen.queryByRole('button', { name: 'Clear filters' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Showing 2 of 2 saved runs.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Template: API Design Partner'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'API Design Partner' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
  });
});
