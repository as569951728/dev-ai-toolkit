import { describe, expect, it } from 'vitest';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { createLocalStoragePromptTemplateRepository } from '@/features/prompt-templates/repositories/local-storage-prompt-template-repository';

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

describe('local-storage-prompt-template-repository', () => {
  it('reads legacy array payloads and new versioned payloads', () => {
    const legacyStorage = createMemoryStorage({
      legacy: JSON.stringify(mockPromptTemplates),
    });
    const versionedStorage = createMemoryStorage({
      versioned: JSON.stringify({
        version: 1,
        data: mockPromptTemplates,
      }),
    });

    const legacyRepository = createLocalStoragePromptTemplateRepository(
      'legacy',
      legacyStorage,
    );
    const versionedRepository = createLocalStoragePromptTemplateRepository(
      'versioned',
      versionedStorage,
    );

    expect(legacyRepository.loadAll()).toHaveLength(mockPromptTemplates.length);
    expect(versionedRepository.loadAll()).toHaveLength(mockPromptTemplates.length);
  });

  it('writes templates using the versioned payload shape', () => {
    const storage = createMemoryStorage();
    const repository = createLocalStoragePromptTemplateRepository(
      'templates',
      storage,
    );

    repository.saveAll(mockPromptTemplates);

    expect(JSON.parse(storage.getItem('templates') ?? 'null')).toEqual({
      version: 1,
      data: mockPromptTemplates,
    });
  });
});
