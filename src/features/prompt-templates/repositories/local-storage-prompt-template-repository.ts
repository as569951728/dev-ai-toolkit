import { ensurePromptTemplateVersioning } from '@/features/prompt-templates/lib/prompt-template-versioning';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type { PromptTemplate } from '@/types/prompt-template';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-templates';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function normalizeStoredTemplates(value: unknown) {
  const templates = readVersionedCollection<PromptTemplate>(value);

  return templates && templates.length > 0
    ? templates.map((template) => ensurePromptTemplateVersioning(template))
    : mockPromptTemplates;
}

export function createLocalStoragePromptTemplateRepository(
  storageKey = STORAGE_KEY,
  storage: StorageLike | null =
    typeof window !== 'undefined' ? window.localStorage : null,
): PromptTemplateRepository {
  return {
    loadAll() {
      if (!storage) {
        return mockPromptTemplates;
      }

      const storedValue = storage.getItem(storageKey);

      if (!storedValue) {
        return mockPromptTemplates;
      }

      try {
        return normalizeStoredTemplates(JSON.parse(storedValue));
      } catch {
        return mockPromptTemplates;
      }
    },
    saveAll(templates: PromptTemplate[]) {
      if (!storage) {
        return;
      }

      storage.setItem(
        storageKey,
        JSON.stringify(writeVersionedCollection(templates)),
      );
    },
  };
}
