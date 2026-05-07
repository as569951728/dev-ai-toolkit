import { describe, expect, it } from 'vitest';

import {
  loadRecentTemplateIds,
  saveRecentTemplateIds,
} from '@/features/prompt-playground/repositories/local-storage-recent-template-repository';

function createMemoryStorage(initialState: Record<string, string> = {}) {
  const state = new Map(Object.entries(initialState));

  return {
    getItem(key: string) {
      return state.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      state.set(key, value);
    },
  };
}

describe('local-storage-recent-template-repository', () => {
  it('reads both legacy arrays and versioned payloads', () => {
    const legacyStorage = createMemoryStorage({
      legacy: JSON.stringify(['template-1', 'template-2']),
    });
    const versionedStorage = createMemoryStorage({
      versioned: JSON.stringify({
        version: 1,
        data: ['template-2', 'template-3'],
      }),
    });

    expect(loadRecentTemplateIds('legacy', legacyStorage)).toEqual([
      'template-1',
      'template-2',
    ]);
    expect(loadRecentTemplateIds('versioned', versionedStorage)).toEqual([
      'template-2',
      'template-3',
    ]);
  });

  it('writes recent template ids using the versioned payload shape', () => {
    const storage = createMemoryStorage();

    saveRecentTemplateIds(['template-1', 'template-2'], 'recent', storage);

    expect(JSON.parse(storage.getItem('recent') ?? 'null')).toEqual({
      version: 1,
      data: ['template-1', 'template-2'],
    });
  });
});
