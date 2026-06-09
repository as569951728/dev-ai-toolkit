import { describe, expect, it } from 'vitest';

import {
  createWorkspaceBackupFilename,
  createWorkspaceBackupPayload,
} from '@/features/workspace-backup/lib/workspace-backup-download';

describe('workspace-backup-download', () => {
  it('creates a readable backup filename from an export date', () => {
    expect(
      createWorkspaceBackupFilename('2026-06-10T08:30:00.000Z'),
    ).toBe('dev-ai-toolkit-workspace-2026-06-10.json');
  });

  it('creates workspace backup JSON from current collections', () => {
    const json = createWorkspaceBackupPayload({
      templates: [],
      runs: [],
      notes: [],
      exportedAt: '2026-06-10T08:30:00.000Z',
    });

    expect(JSON.parse(json)).toEqual({
      version: 1,
      exportedAt: '2026-06-10T08:30:00.000Z',
      data: {
        templates: [],
        runs: [],
        notes: [],
      },
    });
  });
});
