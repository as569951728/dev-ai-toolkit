import { describe, expect, it } from 'vitest';

import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
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
      legacy: JSON.stringify(starterPromptTemplates),
    });
    const versionedStorage = createMemoryStorage({
      versioned: JSON.stringify({
        version: 1,
        data: starterPromptTemplates,
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

    expect(legacyRepository.loadAll()).toHaveLength(starterPromptTemplates.length);
    expect(versionedRepository.loadAll()).toHaveLength(starterPromptTemplates.length);
  });

  it('writes templates using the versioned payload shape', () => {
    const storage = createMemoryStorage();
    const repository = createLocalStoragePromptTemplateRepository(
      'templates',
      storage,
    );

    repository.saveAll(starterPromptTemplates);

    expect(JSON.parse(storage.getItem('templates') ?? 'null')).toEqual({
      version: 1,
      data: starterPromptTemplates,
    });
  });

  it('keeps an intentionally saved empty template collection', () => {
    const storage = createMemoryStorage({
      templates: JSON.stringify({
        version: 1,
        data: [],
      }),
    });
    const repository = createLocalStoragePromptTemplateRepository(
      'templates',
      storage,
    );

    expect(repository.loadAll()).toEqual([]);
  });
});
