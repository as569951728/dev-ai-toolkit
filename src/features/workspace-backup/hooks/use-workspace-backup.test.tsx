import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import {
  loadRecentTemplateIds,
  saveRecentTemplateIds,
} from '@/features/prompt-playground/repositories/local-storage-recent-template-repository';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { useWorkspaceBackup } from '@/features/workspace-backup/hooks/use-workspace-backup';
import type { WorkspaceBackupPayload } from '@/features/workspace-backup/lib/workspace-backup-transfer';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

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

function TestConsumer() {
  const { createWorkspaceBackupJson, importWorkspaceBackupJson } =
    useWorkspaceBackup();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const backup = JSON.parse(
            createWorkspaceBackupJson(),
          ) as WorkspaceBackupPayload;
          window.localStorage.setItem(
            'workspace-backup-test',
            `${backup.data.runs[0]!.id}:${backup.data.recentTemplateIds?.join(
              ',',
            )}`,
          );
        }}
      >
        Create backup
      </button>
      <button
        type="button"
        onClick={() => {
          const summary = importWorkspaceBackupJson(
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
          );

          window.localStorage.setItem(
            'workspace-import-summary-test',
            `${summary.templates.updated}:${summary.runs.updated}:${summary.notes.updated}:${summary.recentTemplates.imported}:${summary.recentTemplates.skipped}`,
          );
        }}
      >
        Import backup
      </button>
    </>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('useWorkspaceBackup', () => {
  it('creates a workspace backup JSON string from current app state', () => {
    saveRecentTemplateIds(['missing-template', 'template-1']);

    render(
      <PromptTemplatesProvider repository={createTemplateRepository([template])}>
        <PromptRunsProvider repository={createRunRepository([run])}>
          <PromptRunNotesProvider repository={createNoteRepository([note])}>
            <TestConsumer />
          </PromptRunNotesProvider>
        </PromptRunsProvider>
      </PromptTemplatesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create backup' }));

    expect(window.localStorage.getItem('workspace-backup-test')).toBe(
      'run-1:template-1',
    );
  });

  it('imports a workspace backup JSON string into current app state', () => {
    const templateRepository = createTemplateRepository([template]);
    const runRepository = createRunRepository([run]);
    const noteRepository = createNoteRepository([note]);

    render(
      <PromptTemplatesProvider repository={templateRepository}>
        <PromptRunsProvider repository={runRepository}>
          <PromptRunNotesProvider repository={noteRepository}>
            <TestConsumer />
          </PromptRunNotesProvider>
        </PromptRunsProvider>
      </PromptTemplatesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Import backup' }));

    expect(window.localStorage.getItem('workspace-import-summary-test')).toBe(
      '1:1:1:1:1',
    );
    expect(templateRepository.snapshot()[0]?.name).toBe(
      'Imported Review Assistant',
    );
    expect(runRepository.snapshot()[0]?.templateName).toBe(
      'Imported Review Assistant',
    );
    expect(noteRepository.snapshot()[0]?.body).toBe('Imported note body.');
    expect(loadRecentTemplateIds()).toEqual(['template-1']);
  });
});
