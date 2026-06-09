import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
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

function createNoteRepository(
  initialNotes: PromptRunNote[] = [],
): PromptRunNoteRepository {
  let notes = [...initialNotes];

  return {
    loadAll: () => [...notes],
    saveAll: (nextNotes) => {
      notes = [...nextNotes];
    },
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
  render(
    <PromptTemplatesProvider repository={createTemplateRepository([template])}>
      <PromptRunsProvider repository={createRunRepository([run])}>
        <PromptRunNotesProvider repository={createNoteRepository([note])}>
          <WorkspaceBackupPage />
        </PromptRunNotesProvider>
      </PromptRunsProvider>
    </PromptTemplatesProvider>,
  );
}

describe('WorkspaceBackupPage', () => {
  it('shows current local workspace counts and exports a backup file', () => {
    renderWorkspaceBackupPage();

    expect(screen.getByRole('heading', { name: 'Workspace backup' })).toBeInTheDocument();
    expect(screen.getByText('1 prompt template')).toBeInTheDocument();
    expect(screen.getByText('1 saved run')).toBeInTheDocument();
    expect(screen.getByText('1 run note')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export workspace JSON' }));

    expect(downloadWorkspaceBackupMock).toHaveBeenCalledWith({
      templates: [template],
      runs: [run],
      notes: [note],
    });
  });
});
