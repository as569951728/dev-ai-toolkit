import { describe, expect, it } from 'vitest';

import { mergeWorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-merge';
import type { WorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-transfer';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

function createTemplate(id: string, name = id): PromptTemplate {
  return {
    id,
    name,
    description: `Description for ${name}`,
    systemPrompt: 'System prompt',
    userPrompt: 'User prompt',
    tags: [],
    version: 1,
    revisions: [
      {
        version: 1,
        updatedAt: '2026-06-10T08:00:00.000Z',
        name,
        description: `Description for ${name}`,
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
        tags: [],
      },
    ],
    archivedAt: null,
    updatedAt: '2026-06-10T08:00:00.000Z',
  };
}

function createRun(id: string, templateName = id): PromptRunRecord {
  return {
    id,
    templateId: 'template-1',
    templateName,
    templateVersion: 1,
    variables: {},
    systemPrompt: 'System prompt',
    userPrompt: 'User prompt',
    createdAt: '2026-06-10T08:00:00.000Z',
  };
}

function createNote(id: string, body = id): PromptRunNote {
  return {
    id,
    runId: 'run-1',
    body,
    createdAt: '2026-06-10T08:00:00.000Z',
    updatedAt: '2026-06-10T08:00:00.000Z',
  };
}

describe('workspace-backup-merge', () => {
  it('merges workspace backup data by id and reports import counts', () => {
    const current: WorkspaceBackupData = {
      templates: [createTemplate('template-1', 'Current Template')],
      runs: [createRun('run-1', 'Current Run')],
      notes: [createNote('note-1', 'Current note')],
    };
    const incoming: WorkspaceBackupData = {
      templates: [
        createTemplate('template-1', 'Imported Template'),
        createTemplate('template-2', 'New Template'),
      ],
      runs: [
        createRun('run-1', 'Imported Run'),
        createRun('run-2', 'New Run'),
      ],
      notes: [
        createNote('note-1', 'Imported note'),
        createNote('note-2', 'New note'),
      ],
    };

    const result = mergeWorkspaceBackupData(current, incoming);

    expect(result.data.templates.map((template) => template.name)).toEqual([
      'Imported Template',
      'New Template',
    ]);
    expect(result.data.runs.map((run) => run.templateName)).toEqual([
      'Imported Run',
      'New Run',
    ]);
    expect(result.data.notes.map((note) => note.body)).toEqual([
      'Imported note',
      'New note',
    ]);
    expect(result.summary).toEqual({
      templates: { created: 1, updated: 1, total: 2 },
      runs: { created: 1, updated: 1, total: 2 },
      notes: { created: 1, updated: 1, total: 2 },
    });
  });

  it('keeps current data when incoming collections are empty', () => {
    const current: WorkspaceBackupData = {
      templates: [createTemplate('template-1')],
      runs: [createRun('run-1')],
      notes: [createNote('note-1')],
    };

    const result = mergeWorkspaceBackupData(current, {
      templates: [],
      runs: [],
      notes: [],
    });

    expect(result.data).toEqual(current);
    expect(result.summary.templates).toEqual({
      created: 0,
      updated: 0,
      total: 0,
    });
  });
});
