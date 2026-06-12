import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { saveRecentTemplateIds } from '@/features/prompt-playground/repositories/local-storage-recent-template-repository';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { downloadWorkspaceBackup } from '@/features/workspace-backup/lib/workspace-backup-download';
import { WorkspaceBackupPage } from '@/features/workspace-backup/pages/workspace-backup-page';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

vi.mock('@/features/workspace-backup/lib/workspace-backup-download', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/workspace-backup/lib/workspace-backup-download')>();

  return {
    ...actual,
    downloadWorkspaceBackup: vi.fn(),
  };
});

const downloadWorkspaceBackupMock = vi.mocked(downloadWorkspaceBackup);

function createTemplateRepository(
  initialTemplates: PromptTemplate[] = [],
): PromptTemplateRepository & { snapshot: () => PromptTemplate[] } {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
    snapshot: () => [...templates],
  };
}

function createRunRepository(
  initialRuns: PromptRunRecord[] = [],
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

const template: PromptTemplate = {
  id: 'template-1',
  name: 'Code Review Assistant',
  description: 'Review code before opening a pull request.',
  systemPrompt: 'You are a careful reviewer.',
  userPrompt: 'Review {{diff}}.',
  tags: ['review'],
  version: 1,
  revisions: [
    {
      version: 1,
      updatedAt: '2026-05-01T08:00:00.000Z',
      name: 'Code Review Assistant',
      description: 'Review code before opening a pull request.',
      systemPrompt: 'You are a careful reviewer.',
      userPrompt: 'Review {{diff}}.',
      tags: ['review'],
    },
  ],
  archivedAt: null,
  updatedAt: '2026-05-01T08:00:00.000Z',
};

const run: PromptRunRecord = {
  id: 'run-1',
  templateId: 'template-1',
  templateName: 'Code Review Assistant',
  templateVersion: 1,
  variables: { diff: 'src/App.tsx' },
  systemPrompt: 'You are a careful reviewer.',
  userPrompt: 'Review src/App.tsx.',
  createdAt: '2026-05-02T08:00:00.000Z',
};

const note: PromptRunNote = {
  id: 'note-1',
  runId: 'run-1',
  body: 'Use this run as a baseline.',
  createdAt: '2026-05-03T08:00:00.000Z',
  updatedAt: '2026-05-03T08:00:00.000Z',
};

function renderWorkspaceBackupPage() {
  const templateRepository = createTemplateRepository([template]);
  const runRepository = createRunRepository([run]);
  const noteRepository = createNoteRepository([note]);

  render(
    <PromptTemplatesProvider repository={templateRepository}>
      <PromptRunsProvider repository={runRepository}>
        <PromptRunNotesProvider repository={noteRepository}>
          <WorkspaceBackupPage />
        </PromptRunNotesProvider>
      </PromptRunsProvider>
    </PromptTemplatesProvider>,
  );

  return {
    noteRepository,
    runRepository,
    templateRepository,
  };
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('WorkspaceBackupPage', () => {
  it('shows current local workspace counts and exports a backup file', () => {
    saveRecentTemplateIds(['missing-template', 'template-1']);

    renderWorkspaceBackupPage();

    expect(screen.getByRole('heading', { name: 'Workspace backup' })).toBeInTheDocument();
    expect(screen.getByText('1 prompt template')).toBeInTheDocument();
    expect(screen.getByText('1 saved run')).toBeInTheDocument();
    expect(screen.getByText('1 run note')).toBeInTheDocument();
    expect(screen.getByText('1 recent template')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export workspace JSON' }));

    expect(downloadWorkspaceBackupMock).toHaveBeenCalledWith({
      templates: [template],
      runs: [run],
      notes: [note],
      recentTemplateIds: ['template-1'],
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Workspace backup exported as JSON.',
    );
  });

  it('imports a workspace backup JSON file and shows a summary', async () => {
    const { noteRepository, runRepository, templateRepository } =
      renderWorkspaceBackupPage();
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          exportedAt: '2026-06-10T08:30:00.000Z',
          data: {
            templates: [{ ...template, name: 'Imported Review Assistant' }],
            runs: [{ ...run, templateName: 'Imported Review Assistant' }],
            notes: [{ ...note, body: 'Imported note body.' }],
            recentTemplateIds: ['template-1', 'missing-template'],
          },
        }),
      ],
      'workspace-backup.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import workspace JSON'), {
      target: { files: [file] },
    });

    expect(await screen.findByText('Workspace backup imported.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Workspace backup imported.',
    );
    expect(screen.getByText('Templates: 0 created, 1 updated.')).toBeInTheDocument();
    expect(screen.getByText('Runs: 0 created, 1 updated.')).toBeInTheDocument();
    expect(screen.getByText('Notes: 0 created, 1 updated.')).toBeInTheDocument();
    expect(
      screen.getByText('Recent templates: 1 imported, 1 skipped.'),
    ).toBeInTheDocument();
    expect(screen.getByText('1 recent template')).toBeInTheDocument();
    expect(templateRepository.snapshot()[0]?.name).toBe(
      'Imported Review Assistant',
    );
    expect(runRepository.snapshot()[0]?.templateName).toBe(
      'Imported Review Assistant',
    );
    expect(noteRepository.snapshot()[0]?.body).toBe('Imported note body.');
  });

  it('shows an import error when the selected backup is invalid', async () => {
    const { noteRepository, runRepository, templateRepository } =
      renderWorkspaceBackupPage();
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          exportedAt: '2026-06-10T08:30:00.000Z',
          data: {
            templates: [template],
            runs: [run],
            notes: [{ ...note, runId: 'missing-run' }],
          },
        }),
      ],
      'invalid-workspace-backup.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import workspace JSON'), {
      target: { files: [file] },
    });

    expect(await screen.findByText('Import failed')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Import failed');
    expect(
      screen.getByText('Invalid workspace backup format.'),
    ).toBeInTheDocument();
    expect(templateRepository.snapshot()).toEqual([template]);
    expect(runRepository.snapshot()).toEqual([run]);
    expect(noteRepository.snapshot()).toEqual([note]);
  });
});
