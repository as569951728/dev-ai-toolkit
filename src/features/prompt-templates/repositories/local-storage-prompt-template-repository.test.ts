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

  it('returns a fresh copy of starter templates when storage is empty', () => {
    const repository = createLocalStoragePromptTemplateRepository(
      'templates',
      createMemoryStorage(),
    );
    const firstLoad = repository.loadAll();

    firstLoad[0]!.name = 'Mutated template name';
    firstLoad[0]!.tags.push('mutated-tag');
    firstLoad[0]!.revisions[0]!.tags.push('mutated-revision-tag');

    const secondLoad = repository.loadAll();

    expect(secondLoad[0]!.name).toBe(starterPromptTemplates[0]!.name);
    expect(secondLoad[0]!.tags).not.toContain('mutated-tag');
    expect(secondLoad[0]!.revisions[0]!.tags).not.toContain(
      'mutated-revision-tag',
    );
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

  it('ignores malformed stored template records', () => {
    const storage = createMemoryStorage({
      templates: JSON.stringify({
        version: 1,
        data: [
          { id: 'template-without-prompts' },
          { ...starterPromptTemplates[0], tags: 'review' },
          starterPromptTemplates[1],
        ],
      }),
    });
    const repository = createLocalStoragePromptTemplateRepository(
      'templates',
      storage,
    );

    expect(repository.loadAll()).toEqual([starterPromptTemplates[1]]);
  });

  it('keeps the last valid template when stored ids are repeated', () => {
    const storage = createMemoryStorage({
      templates: JSON.stringify({
        version: 1,
        data: [
          { ...starterPromptTemplates[0], name: 'Older template copy' },
          { ...starterPromptTemplates[0], name: 'Latest template copy' },
          starterPromptTemplates[1],
        ],
      }),
    });
    const repository = createLocalStoragePromptTemplateRepository(
      'templates',
      storage,
    );

    expect(repository.loadAll().map((template) => template.name)).toEqual([
      'Latest template copy',
      starterPromptTemplates[1]!.name,
    ]);
  });
});
