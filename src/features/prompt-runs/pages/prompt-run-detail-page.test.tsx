import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { exportPromptRunAsJson } from '@/features/prompt-runs/lib/prompt-run-export';
import { PromptRunDetailPage } from '@/features/prompt-runs/pages/prompt-run-detail-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

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

function renderRunDetail(
  initialEntry: string,
  initialRuns: PromptRunRecord[],
  templateRepository = createTemplateRepository(),
  noteRepository = createNoteRepository(),
) {
  const runRepository = createRunRepository(initialRuns);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={templateRepository}>
        <PromptRunsProvider repository={runRepository}>
          <PromptRunNotesProvider repository={noteRepository}>
            <Routes>
              <Route path="/runs/:runId" element={<PromptRunDetailPage />} />
              <Route path="/runs" element={<div>Run History Destination</div>} />
            </Routes>
          </PromptRunNotesProvider>
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );

  return {
    noteRepository,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PromptRunDetailPage', () => {
  it('shows a saved run with variables, prompts, and source template link', () => {
    renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
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
    ).toHaveAttribute('href', `/prompts/${starterPromptTemplates[0]!.id}`);
    expect(
      screen.getByRole('link', { name: 'Open output in Code Viewer' }),
    ).toHaveAttribute(
      'href',
      `/code-viewer?left=${encodeURIComponent('Review the code carefully.')}&right=${encodeURIComponent('Focus on bugs and missing tests.')}&mode=compare&language=markdown`,
    );
    expect(
      screen.getByRole('link', { name: 'Compare with source' }),
    ).toHaveAttribute('href', expect.stringContaining('/prompt-diff?left='));
  });

  it('saves a maintenance note for the current run', () => {
    const { noteRepository } = renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
        templateVersion: 2,
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

    expect(compareUrl.searchParams.get('left')).toBe(
      'Original system prompt v1.\n\nOriginal user prompt v1.',
    );
    expect(compareUrl.searchParams.get('right')).toBe(
      'Generated system prompt.\n\nGenerated user prompt.',
    );
  });

  it('exports the current run with saved note context', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: starterPromptTemplates[0]!.id,
      templateName: starterPromptTemplates[0]!.name,
      templateVersion: 2,
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

    expect(exportPromptRunAsJsonMock).toHaveBeenCalledWith({ run, note });
  });

  it('asks for confirmation before deleting the current run and its saved note', () => {
    const runRepository = createRunRepository([
      {
        id: 'run-1',
        templateId: starterPromptTemplates[0]!.id,
        templateName: starterPromptTemplates[0]!.name,
        templateVersion: 2,
        variables: {},
        systemPrompt: 'System',
        userPrompt: 'User',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);
    const noteRepository = createNoteRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Good baseline for future review prompts.',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    render(
      <MemoryRouter initialEntries={['/runs/run-1']}>
        <PromptTemplatesProvider repository={createTemplateRepository()}>
          <PromptRunsProvider repository={runRepository}>
            <PromptRunNotesProvider repository={noteRepository}>
              <Routes>
                <Route path="/runs/:runId" element={<PromptRunDetailPage />} />
                <Route path="/runs" element={<div>Run History Destination</div>} />
              </Routes>
            </PromptRunNotesProvider>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete run' }));

    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(runRepository.loadAll()).toHaveLength(1);
    expect(noteRepository.snapshot()).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByText('Run History Destination')).toBeInTheDocument();
    expect(runRepository.loadAll()).toEqual([]);
    expect(noteRepository.snapshot()).toEqual([]);
  });

  it('shows a not-found state when the run is missing', () => {
    renderRunDetail('/runs/missing-run', []);

    expect(screen.getByText('Run not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Run History' }),
    ).toHaveAttribute('href', '/runs');
  });
});
