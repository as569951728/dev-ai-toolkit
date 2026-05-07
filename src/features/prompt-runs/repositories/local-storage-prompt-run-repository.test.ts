import { describe, expect, it } from 'vitest';

import { createLocalStoragePromptRunRepository } from '@/features/prompt-runs/repositories/local-storage-prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

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

const sampleRuns: PromptRunRecord[] = [
  {
    id: 'run-1',
    templateId: 'template-1',
    templateName: 'Code Review Assistant',
    templateVersion: 1,
    variables: { repository_name: 'dev-ai-toolkit' },
    systemPrompt: 'System output',
    userPrompt: 'User output',
    createdAt: '2026-05-07T01:30:00.000Z',
  },
];

describe('local-storage-prompt-run-repository', () => {
  it('reads legacy array payloads and new versioned payloads', () => {
    const legacyStorage = createMemoryStorage({
      legacy: JSON.stringify(sampleRuns),
    });
    const versionedStorage = createMemoryStorage({
      versioned: JSON.stringify({
        version: 1,
        data: sampleRuns,
      }),
    });

    const legacyRepository = createLocalStoragePromptRunRepository(
      'legacy',
      legacyStorage,
    );
    const versionedRepository = createLocalStoragePromptRunRepository(
      'versioned',
      versionedStorage,
    );

    expect(legacyRepository.loadAll()).toEqual(sampleRuns);
    expect(versionedRepository.loadAll()).toEqual(sampleRuns);
  });

  it('writes runs using the versioned payload shape', () => {
    const storage = createMemoryStorage();
    const repository = createLocalStoragePromptRunRepository('runs', storage);

    repository.saveAll(sampleRuns);

    expect(JSON.parse(storage.getItem('runs') ?? 'null')).toEqual({
      version: 1,
      data: sampleRuns,
    });
  });
});
