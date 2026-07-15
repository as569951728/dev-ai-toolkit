import { describe, expect, it, vi } from 'vitest';

import {
  assertLocalStorageKeyWritable,
  clearLocalStorageReadIssue,
  decodeLocalStorageValue,
  getLocalStorageReadIssues,
  subscribeToLocalStorageReadIssues,
} from '@/lib/local-storage-recovery';

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
});
