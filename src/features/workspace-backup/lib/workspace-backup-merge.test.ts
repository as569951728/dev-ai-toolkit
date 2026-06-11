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

function createNote(id: string, body = id, runId = 'run-1'): PromptRunNote {
  return {
    id,
    runId,
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
        createNote('note-2', 'New note', 'run-2'),
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
      recentTemplates: { imported: 0, skipped: 0, total: 0 },
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
    expect(result.summary.recentTemplates).toEqual({
      imported: 0,
      skipped: 0,
      total: 0,
    });
  });

  it('merges notes by run id even when imported note ids differ', () => {
    const current: WorkspaceBackupData = {
      templates: [],
      runs: [createRun('run-1')],
      notes: [createNote('note-1', 'Current note', 'run-1')],
    };
    const incoming: WorkspaceBackupData = {
      templates: [],
      runs: [],
      notes: [createNote('imported-note', 'Imported note', 'run-1')],
    };

    const result = mergeWorkspaceBackupData(current, incoming);

    expect(result.data.notes).toEqual([
      createNote('imported-note', 'Imported note', 'run-1'),
    ]);
    expect(result.summary.notes).toEqual({
      created: 0,
      updated: 1,
      total: 1,
    });
  });

  it('counts repeated incoming keys once in the import summary', () => {
    const current: WorkspaceBackupData = {
      templates: [],
      runs: [],
      notes: [],
    };
    const incoming: WorkspaceBackupData = {
      templates: [
        createTemplate('template-1', 'First Template'),
        createTemplate('template-1', 'Last Template'),
      ],
      runs: [
        createRun('run-1', 'First Run'),
        createRun('run-1', 'Last Run'),
      ],
      notes: [
        createNote('note-1', 'First note', 'run-1'),
        createNote('note-2', 'Last note', 'run-1'),
      ],
    };

    const result = mergeWorkspaceBackupData(current, incoming);

    expect(result.data.templates.map((template) => template.name)).toEqual([
      'Last Template',
    ]);
    expect(result.data.runs.map((run) => run.templateName)).toEqual([
      'Last Run',
    ]);
    expect(result.data.notes.map((note) => note.body)).toEqual(['Last note']);
    expect(result.summary).toEqual({
      templates: { created: 1, updated: 0, total: 1 },
      runs: { created: 1, updated: 0, total: 1 },
      notes: { created: 1, updated: 0, total: 1 },
      recentTemplates: { imported: 0, skipped: 0, total: 0 },
    });
  });

  it('summarizes recent template shortcuts against merged templates', () => {
    const current: WorkspaceBackupData = {
      templates: [createTemplate('template-1')],
      runs: [],
      notes: [],
    };
    const incoming: WorkspaceBackupData = {
      templates: [createTemplate('template-2')],
      runs: [],
      notes: [],
      recentTemplateIds: ['template-2', 'missing-template', 'template-2'],
    };

    const result = mergeWorkspaceBackupData(current, incoming);

    expect(result.data.recentTemplateIds).toEqual(['template-2']);
    expect(result.summary.recentTemplates).toEqual({
      imported: 1,
      skipped: 1,
      total: 2,
    });
  });
});
