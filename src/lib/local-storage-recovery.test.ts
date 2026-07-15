import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  assertLocalStorageKeyWritable,
  clearLocalStorageReadIssue,
  createLocalStorageRecoveryFilename,
  createLocalStorageRecoveryPayload,
  decodeLocalStorageValue,
  downloadLocalStorageRecovery,
  getLocalStorageReadIssues,
  reportLocalStorageReadIssue,
  resetLocalStorageReadIssues,
  subscribeToLocalStorageReadIssues,
} from '@/lib/local-storage-recovery';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('local-storage-recovery', () => {
  it('keeps malformed JSON available as a read issue', () => {
    expect(
      decodeLocalStorageValue({
        decode: () => ({ recovered: false, value: [] }),
        label: 'Prompt runs',
        rawValue: '{not-json',
        storageKey: 'runs',
      }),
    ).toBeNull();

    expect(getLocalStorageReadIssues()).toEqual([
      {
        label: 'Prompt runs',
        rawValue: '{not-json',
        reason: 'invalid-json',
        storageKey: 'runs',
      },
    ]);
    expect(() => assertLocalStorageKeyWritable('runs')).toThrow(
      'Unreadable local data must be downloaded or reset before it can be replaced.',
    );
  });

  it('returns recovered records while preserving the original payload', () => {
    const rawValue = JSON.stringify(['valid-record', null]);

    expect(
      decodeLocalStorageValue({
        decode: () => ({ recovered: true, value: ['valid-record'] }),
        label: 'Prompt templates',
        rawValue,
        storageKey: 'templates',
      }),
    ).toEqual(['valid-record']);

    expect(getLocalStorageReadIssues()[0]).toMatchObject({
      rawValue,
      reason: 'invalid-data',
      storageKey: 'templates',
    });
  });

  it('clears a previous issue after the stored value becomes valid', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLocalStorageReadIssues(listener);

    decodeLocalStorageValue({
      decode: () => null,
      label: 'Run notes',
      rawValue: '{}',
      storageKey: 'notes',
    });
    decodeLocalStorageValue({
      decode: () => ({ recovered: false, value: [] }),
      label: 'Run notes',
      rawValue: '[]',
      storageKey: 'notes',
    });

    expect(getLocalStorageReadIssues()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    clearLocalStorageReadIssue('notes');
  });

  it('creates a dated recovery file that preserves raw values', () => {
    const exportedAt = '2026-07-15T01:00:00.000Z';
    const issues = [
      {
        label: 'Prompt templates',
        rawValue: '{private malformed data',
        reason: 'invalid-json' as const,
        storageKey: 'templates',
      },
    ];

    expect(createLocalStorageRecoveryFilename(exportedAt)).toBe(
      'dev-ai-toolkit-unreadable-local-data-2026-07-15.json',
    );
    expect(JSON.parse(createLocalStorageRecoveryPayload(issues, exportedAt)))
      .toEqual({
        version: 1,
        exportedAt,
        entries: issues,
      });
  });

  it('downloads the recovery payload and removes its temporary URL', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T01:00:00.000Z'));
    const createObjectURL = vi.fn(() => 'blob:local-storage-recovery');
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

    downloadLocalStorageRecovery([
      {
        label: 'Prompt runs',
        rawValue: '{not-json',
        reason: 'invalid-json',
        storageKey: 'runs',
      },
    ]);

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect(link.download).toBe(
      'dev-ai-toolkit-unreadable-local-data-2026-07-15.json',
    );
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:local-storage-recovery',
    );
  });

  it('restores earlier values when a later reset fails', () => {
    const issues = [
      {
        label: 'Prompt templates',
        rawValue: '{broken-templates',
        reason: 'invalid-json' as const,
        storageKey: 'templates',
      },
      {
        label: 'Prompt runs',
        rawValue: '{broken-runs',
        reason: 'invalid-json' as const,
        storageKey: 'runs',
      },
    ];
    const state = new Map(issues.map((issue) => [issue.storageKey, issue.rawValue]));

    issues.forEach(reportLocalStorageReadIssue);

    expect(() =>
      resetLocalStorageReadIssues(issues, {
        getItem: (key) => state.get(key) ?? null,
        removeItem(key) {
          if (key === 'runs') {
            throw new Error('Storage unavailable');
          }

          state.delete(key);
        },
        setItem: (key, value) => state.set(key, value),
      }),
    ).toThrow('Storage unavailable');

    expect(Object.fromEntries(state)).toEqual({
      runs: '{broken-runs',
      templates: '{broken-templates',
    });
    expect(getLocalStorageReadIssues()).toEqual(issues);
  });

  it('retains recovery entries when reset rollback also fails', () => {
    const issues = [
      {
        label: 'Prompt templates',
        rawValue: '{broken-templates',
        reason: 'invalid-json' as const,
        storageKey: 'templates',
      },
      {
        label: 'Prompt runs',
        rawValue: '{broken-runs',
        reason: 'invalid-json' as const,
        storageKey: 'runs',
      },
    ];

    issues.forEach(reportLocalStorageReadIssue);

    expect(() =>
      resetLocalStorageReadIssues(issues, {
        getItem: () => null,
        removeItem(key) {
          if (key === 'runs') {
            throw new Error('Remove unavailable');
          }
        },
        setItem() {
          throw new Error('Rollback unavailable');
        },
      }),
    ).toThrow('Rollback unavailable');

    expect(getLocalStorageReadIssues()).toEqual(issues);
  });
});
