import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceBackup,
  filterNotesForWorkspaceBackup,
  parseWorkspaceBackupImport,
  stringifyWorkspaceBackup,
} from '@/features/workspace-backup/lib/workspace-backup-transfer';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

const template: PromptTemplate = {
  id: 'template-1',
  name: 'Code Review Assistant',
  description: 'Review code changes before opening a pull request.',
  systemPrompt: 'You are a careful reviewer.',
  userPrompt: 'Review {{diff}}.',
  tags: ['review'],
  version: 2,
  revisions: [
    {
      version: 1,
      updatedAt: '2026-05-01T08:00:00.000Z',
      name: 'Code Review Assistant',
      description: 'Initial review prompt.',
      systemPrompt: 'You are a reviewer.',
      userPrompt: 'Review {{diff}}.',
      tags: ['review'],
    },
    {
      version: 2,
      updatedAt: '2026-05-02T08:00:00.000Z',
      name: 'Code Review Assistant',
      description: 'Review code changes before opening a pull request.',
      systemPrompt: 'You are a careful reviewer.',
      userPrompt: 'Review {{diff}}.',
      tags: ['review'],
    },
  ],
  archivedAt: null,
  updatedAt: '2026-05-02T08:00:00.000Z',
};

const run: PromptRunRecord = {
  id: 'run-1',
  templateId: 'template-1',
  templateName: 'Code Review Assistant',
  templateVersion: 2,
  variables: { diff: 'src/App.tsx' },
  systemPrompt: 'You are a careful reviewer.',
  userPrompt: 'Review src/App.tsx.',
  createdAt: '2026-05-03T08:00:00.000Z',
};

const note: PromptRunNote = {
  id: 'note-1',
  runId: 'run-1',
  body: 'Useful baseline for future UI reviews.',
  createdAt: '2026-05-04T08:00:00.000Z',
  updatedAt: '2026-05-04T08:00:00.000Z',
};

describe('workspace-backup-transfer', () => {
  it('keeps only notes that reference exported runs', () => {
    const orphanedNote = {
      ...note,
      id: 'orphaned-note',
      runId: 'missing-run',
    };

    expect(filterNotesForWorkspaceBackup([note, orphanedNote], [run])).toEqual([
      note,
    ]);
  });

  it('builds a versioned workspace backup payload', () => {
    const backup = buildWorkspaceBackup({
      templates: [template],
      runs: [run],
      notes: [note],
      recentTemplateIds: ['template-1'],
    });

    expect(backup.version).toBe(1);
    expect(new Date(backup.exportedAt).getTime()).not.toBeNaN();
    expect(backup.data.templates).toEqual([template]);
    expect(backup.data.runs).toEqual([run]);
    expect(backup.data.notes).toEqual([note]);
    expect(backup.data.recentTemplateIds).toEqual(['template-1']);
  });

  it('stringifies and parses workspace backup payloads', () => {
    const rawBackup = stringifyWorkspaceBackup({
      templates: [template],
      runs: [run],
      notes: [note],
      recentTemplateIds: ['template-1', ' ', 'template-1'],
    });

    const parsedBackup = parseWorkspaceBackupImport(rawBackup);

    expect(parsedBackup.data.templates[0]?.id).toBe('template-1');
    expect(parsedBackup.data.runs[0]?.id).toBe('run-1');
    expect(parsedBackup.data.notes[0]?.id).toBe('note-1');
    expect(parsedBackup.data.recentTemplateIds).toEqual(['template-1']);
  });

  it('normalizes identifiers without rewriting workspace content', () => {
    const parsedBackup = parseWorkspaceBackupImport(
      stringifyWorkspaceBackup({
        templates: [
          {
            ...template,
            id: ' template-1 ',
            systemPrompt: '  Preserve template whitespace.  ',
            revisions: template.revisions.map((revision) => ({
              ...revision,
              systemPrompt: '  Preserve template whitespace.  ',
            })),
          },
        ],
        runs: [
          {
            ...run,
            id: ' run-1 ',
            templateId: ' template-1 ',
            templateName: ' Code Review Assistant ',
            userPrompt: '  Preserve run whitespace.  ',
          },
        ],
        notes: [
          {
            ...note,
            id: ' note-1 ',
            runId: ' run-1 ',
            body: '  Preserve note whitespace.  ',
          },
        ],
      }),
    );

    expect(parsedBackup.data.templates[0]).toMatchObject({
      id: 'template-1',
      systemPrompt: '  Preserve template whitespace.  ',
    });
    expect(parsedBackup.data.runs[0]).toMatchObject({
      id: 'run-1',
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      userPrompt: '  Preserve run whitespace.  ',
    });
    expect(parsedBackup.data.notes[0]).toMatchObject({
      id: 'note-1',
      runId: 'run-1',
      body: '  Preserve note whitespace.  ',
    });
  });

  it('parses older backups without recent template shortcuts', () => {
    const parsedBackup = parseWorkspaceBackupImport(
      JSON.stringify({
        version: 1,
        exportedAt: '2026-05-04T08:00:00.000Z',
        data: {
          templates: [template],
          runs: [run],
          notes: [note],
        },
      }),
    );

    expect(parsedBackup.data.recentTemplateIds).toBeUndefined();
  });

  it('accepts saved runs after their source template is deleted', () => {
    const parsedBackup = parseWorkspaceBackupImport(
      JSON.stringify({
        version: 1,
        exportedAt: '2026-05-04T08:00:00.000Z',
        data: {
          templates: [],
          runs: [run],
          notes: [note],
        },
      }),
    );

    expect(parsedBackup.data.templates).toEqual([]);
    expect(parsedBackup.data.runs).toEqual([run]);
    expect(parsedBackup.data.notes).toEqual([note]);
  });

  it('rejects unsupported or incomplete workspace backup payloads', () => {
    expect(() => parseWorkspaceBackupImport('{not-json')).toThrow(
      'Invalid workspace backup format.',
    );

    expect(() =>
      parseWorkspaceBackupImport(JSON.stringify({ version: 99, data: {} })),
    ).toThrow('Unsupported workspace backup version.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: { templates: [], runs: [] },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [run],
            notes: [note],
            recentTemplateIds: ['template-1', 42],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [
              {
                ...template,
                revisions: [
                  ...template.revisions,
                  {
                    ...template.revisions[0],
                    version: template.version + 1,
                  },
                ],
              },
            ],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');
  });

  it('rejects workspace backups with malformed records', () => {
    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [{ id: 'template-1' }],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [{ id: 'run-1' }],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [run],
            notes: [{ id: 'note-1' }],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');
  });

  it('rejects duplicate primary records before workspace preview', () => {
    const parseData = (data: {
      templates: PromptTemplate[];
      runs: PromptRunRecord[];
      notes: PromptRunNote[];
    }) =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data,
        }),
      );

    expect(() =>
      parseData({
        templates: [template, { ...template, id: ' template-1 ' }],
        runs: [run],
        notes: [note],
      }),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseData({
        templates: [template],
        runs: [run, { ...run, id: ' run-1 ' }],
        notes: [note],
      }),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseData({
        templates: [template],
        runs: [run],
        notes: [note, { ...note, id: 'note-2', runId: ' run-1 ' }],
      }),
    ).toThrow('Invalid workspace backup format.');
  });

  it('rejects workspace backups with malformed template revisions', () => {
    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [
              {
                ...template,
                revisions: [{ version: 1 }],
              },
            ],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [
              {
                ...template,
                revisions: [{ ...template.revisions[0], version: 1.5 }],
              },
            ],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [
              {
                ...template,
                revisions: template.revisions.filter(
                  (revision) => revision.version !== template.version,
                ),
              },
            ],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [
              {
                ...template,
                revisions: [
                  ...template.revisions,
                  {
                    ...template.revisions[0],
                    updatedAt: '2026-05-03T08:00:00.000Z',
                  },
                ],
              },
            ],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');
  });

  it('rejects workspace templates whose current revision has different content', () => {
    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [
              {
                ...template,
                systemPrompt: `${template.systemPrompt}\nReturn a short summary.`,
              },
            ],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');
  });

  it('rejects workspace backups with blank identifiers or invalid dates', () => {
    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [{ ...template, id: '   ' }],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [{ ...run, createdAt: 'not-a-date' }],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [run],
            notes: [{ ...note, runId: '' }],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [{ ...template, version: 0 }],
            runs: [run],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');

    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [{ ...run, templateVersion: 0 }],
            notes: [note],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');
  });

  it('rejects workspace backups with notes that do not reference exported runs', () => {
    expect(() =>
      parseWorkspaceBackupImport(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-05-04T08:00:00.000Z',
          data: {
            templates: [template],
            runs: [run],
            notes: [{ ...note, runId: 'missing-run' }],
          },
        }),
      ),
    ).toThrow('Invalid workspace backup format.');
  });
});
