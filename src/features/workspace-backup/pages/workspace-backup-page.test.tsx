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
import {
  parseWorkspaceBackupImport,
  stringifyWorkspaceBackup,
} from '@/features/workspace-backup/lib/workspace-backup-transfer';
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

function renderWorkspaceBackupPage({
  templateRepository = createTemplateRepository([template]),
  runRepository = createRunRepository([run]),
  noteRepository = createNoteRepository([note]),
}: {
  templateRepository?: ReturnType<typeof createTemplateRepository>;
  runRepository?: ReturnType<typeof createRunRepository>;
  noteRepository?: ReturnType<typeof createNoteRepository>;
} = {}) {
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

async function confirmPendingWorkspaceImport() {
  fireEvent.click(
    await screen.findByRole('button', { name: 'Import backup' }),
  );
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
    expect(
      screen.getByText(
        'Prompt snapshots with source template references and captured variables.',
      ),
    ).toBeInTheDocument();
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

  it('reports a failed workspace export and allows retrying', () => {
    downloadWorkspaceBackupMock
      .mockImplementationOnce(() => {
        throw new Error('Downloads are unavailable.');
      })
      .mockImplementationOnce(() => undefined);
    renderWorkspaceBackupPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Export workspace JSON' }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to export the workspace backup. Please try again.',
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Export workspace JSON' }),
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Workspace backup exported as JSON.',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('excludes orphaned notes from a downloadable workspace backup', () => {
    const orphanedNote: PromptRunNote = {
      ...note,
      id: 'orphaned-note',
      runId: 'missing-run',
    };

    renderWorkspaceBackupPage({
      noteRepository: createNoteRepository([note, orphanedNote]),
    });

    expect(screen.getByText('1 run note')).toBeInTheDocument();
    expect(
      screen.getByText(
        '1 unattached note excluded because no matching saved run exists.',
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Export workspace JSON' }),
    );

    const exportedData = downloadWorkspaceBackupMock.mock.calls.at(-1)?.[0];

    expect(exportedData?.notes).toEqual([note]);
    expect(
      parseWorkspaceBackupImport(
        stringifyWorkspaceBackup(
          exportedData ?? { templates: [], runs: [], notes: [] },
        ),
      ).data.notes,
    ).toEqual([note]);
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

    expect(
      await screen.findByRole('heading', {
        name: 'Import this workspace backup?',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'The recent-template shortcut list will also be replaced.',
    );
    expect(
      screen.getByRole('button', { name: 'Keep current workspace' }),
    ).toHaveFocus();
    expect(templateRepository.snapshot()).toEqual([template]);
    expect(runRepository.snapshot()).toEqual([run]);
    expect(noteRepository.snapshot()).toEqual([note]);

    fireEvent.click(
      screen.getByRole('button', { name: 'Keep current workspace' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(templateRepository.snapshot()).toEqual([template]);
    expect(runRepository.snapshot()).toEqual([run]);
    expect(noteRepository.snapshot()).toEqual([note]);

    fireEvent.change(screen.getByLabelText('Import workspace JSON'), {
      target: { files: [file] },
    });
    await confirmPendingWorkspaceImport();

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

  it('restores earlier collections when a later backup write fails', async () => {
    let notes = [note];
    const noteRepository: ReturnType<typeof createNoteRepository> = {
      loadAll: () => [...notes],
      saveAll: (nextNotes) => {
        if (nextNotes[0]?.body === 'Imported note body.') {
          throw new Error('Browser storage rejected the imported notes.');
        }

        notes = [...nextNotes];
      },
      snapshot: () => [...notes],
    };
    const { runRepository, templateRepository } = renderWorkspaceBackupPage({
      noteRepository,
    });
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          exportedAt: '2026-06-10T08:30:00.000Z',
          data: {
            templates: [{ ...template, name: 'Imported Review Assistant' }],
            runs: [{ ...run, templateName: 'Imported Review Assistant' }],
            notes: [{ ...note, body: 'Imported note body.' }],
            recentTemplateIds: ['template-1'],
          },
        }),
      ],
      'workspace-backup.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import workspace JSON'), {
      target: { files: [file] },
    });

    await confirmPendingWorkspaceImport();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Browser storage rejected the imported notes.',
    );
    expect(templateRepository.snapshot()).toEqual([template]);
    expect(runRepository.snapshot()).toEqual([run]);
    expect(noteRepository.snapshot()).toEqual([note]);
    expect(screen.queryByText('Workspace backup imported.')).not.toBeInTheDocument();
  });

  it('removes newly created records when a later backup write fails', async () => {
    const templateRepository = createTemplateRepository();
    const runRepository = createRunRepository();
    const noteRepository: ReturnType<typeof createNoteRepository> = {
      loadAll: () => [],
      saveAll: () => {
        throw new Error('Browser storage rejected the imported notes.');
      },
      snapshot: () => [],
    };
    const importedTemplate = {
      ...template,
      id: 'imported-template',
      revisions: template.revisions.map((revision) => ({
        ...revision,
        name: 'Imported Template',
      })),
      name: 'Imported Template',
    };
    const importedRun = {
      ...run,
      id: 'imported-run',
      templateId: importedTemplate.id,
      templateName: importedTemplate.name,
    };
    const importedNote = {
      ...note,
      id: 'imported-note',
      runId: importedRun.id,
    };

    renderWorkspaceBackupPage({
      templateRepository,
      runRepository,
      noteRepository,
    });
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          exportedAt: '2026-06-10T08:30:00.000Z',
          data: {
            templates: [importedTemplate],
            runs: [importedRun],
            notes: [importedNote],
          },
        }),
      ],
      'workspace-backup.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import workspace JSON'), {
      target: { files: [file] },
    });

    await confirmPendingWorkspaceImport();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Browser storage rejected the imported notes.',
    );
    expect(templateRepository.snapshot()).toEqual([]);
    expect(runRepository.snapshot()).toEqual([]);
    expect(noteRepository.snapshot()).toEqual([]);
  });

  it('reports when a failed backup import cannot be fully restored', async () => {
    let runs = [run];
    const runRepository: ReturnType<typeof createRunRepository> = {
      loadAll: () => [...runs],
      saveAll: (nextRuns) => {
        if (nextRuns[0]?.templateName === run.templateName) {
          throw new Error('Browser storage rejected the run rollback.');
        }

        runs = [...nextRuns];
      },
      snapshot: () => [...runs],
    };
    const noteRepository: ReturnType<typeof createNoteRepository> = {
      loadAll: () => [note],
      saveAll: () => {
        throw new Error('Browser storage rejected the imported notes.');
      },
      snapshot: () => [note],
    };
    const { templateRepository } = renderWorkspaceBackupPage({
      noteRepository,
      runRepository,
    });
    const importedRun = {
      ...run,
      templateName: 'Imported Review Assistant',
    };
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          exportedAt: '2026-06-10T08:30:00.000Z',
          data: {
            templates: [{ ...template, name: 'Imported Review Assistant' }],
            runs: [importedRun],
            notes: [{ ...note, body: 'Imported note body.' }],
          },
        }),
      ],
      'workspace-backup.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import workspace JSON'), {
      target: { files: [file] },
    });

    await confirmPendingWorkspaceImport();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Workspace backup import failed and previous local data could not be fully restored.',
    );
    expect(templateRepository.snapshot()).toEqual([template]);
    expect(runRepository.snapshot()).toEqual([importedRun]);
    expect(noteRepository.snapshot()).toEqual([note]);
  });
});
