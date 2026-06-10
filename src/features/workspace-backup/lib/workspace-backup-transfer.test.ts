import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceBackup,
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
  it('builds a versioned workspace backup payload', () => {
    const backup = buildWorkspaceBackup({
      templates: [template],
      runs: [run],
      notes: [note],
    });

    expect(backup.version).toBe(1);
    expect(new Date(backup.exportedAt).getTime()).not.toBeNaN();
    expect(backup.data.templates).toEqual([template]);
    expect(backup.data.runs).toEqual([run]);
    expect(backup.data.notes).toEqual([note]);
  });

  it('stringifies and parses workspace backup payloads', () => {
    const rawBackup = stringifyWorkspaceBackup({
      templates: [template],
      runs: [run],
      notes: [note],
    });

    const parsedBackup = parseWorkspaceBackupImport(rawBackup);

    expect(parsedBackup.data.templates[0]?.id).toBe('template-1');
    expect(parsedBackup.data.runs[0]?.id).toBe('run-1');
    expect(parsedBackup.data.notes[0]?.id).toBe('note-1');
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
  });
});
