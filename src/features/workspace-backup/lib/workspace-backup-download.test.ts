import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createWorkspaceBackupFilename,
  createWorkspaceBackupPayload,
  downloadWorkspaceBackup,
} from '@/features/workspace-backup/lib/workspace-backup-download';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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
      recentTemplateIds: ['template-1'],
      exportedAt: '2026-06-10T08:30:00.000Z',
    });

    expect(JSON.parse(json)).toEqual({
      version: 1,
      exportedAt: '2026-06-10T08:30:00.000Z',
      data: {
        templates: [],
        runs: [],
        notes: [],
        recentTemplateIds: ['template-1'],
      },
    });
  });

  it('downloads workspace backup JSON with a date-based filename', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T08:30:00.000Z'));

    const createObjectURL = vi.fn(() => 'blob:workspace-backup');
    const revokeObjectURL = vi.fn();
    const link = document.createElement('a');

    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.spyOn(document, 'createElement').mockReturnValue(link);
    const click = vi.spyOn(link, 'click').mockImplementation(() => undefined);

    downloadWorkspaceBackup({
      templates: [],
      runs: [],
      notes: [],
    });

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    expect(link.download).toBe('dev-ai-toolkit-workspace-2026-06-10.json');
    expect(link.href).toBe('blob:workspace-backup');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:workspace-backup');
  });
});
