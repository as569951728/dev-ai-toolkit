import { ensurePromptTemplateVersioning } from '@/features/prompt-templates/lib/prompt-template-versioning';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type { PromptTemplate } from '@/types/prompt-template';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-templates';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function clonePromptTemplate(template: PromptTemplate): PromptTemplate {
  return {
    ...template,
    tags: [...template.tags],
    revisions: template.revisions.map((revision) => ({
      ...revision,
      tags: [...revision.tags],
    })),
  };
}

function loadStarterTemplates() {
  return starterPromptTemplates.map((template) => clonePromptTemplate(template));
}

function normalizeStoredTemplates(value: unknown) {
  const templates = readVersionedCollection<PromptTemplate>(value);

  return templates
    ? templates.map((template) => ensurePromptTemplateVersioning(template))
    : loadStarterTemplates();
}

export function createLocalStoragePromptTemplateRepository(
  storageKey = STORAGE_KEY,
  storage: StorageLike | null =
    typeof window !== 'undefined' ? window.localStorage : null,
): PromptTemplateRepository {
  return {
    loadAll() {
      if (!storage) {
        return loadStarterTemplates();
      }

      const storedValue = storage.getItem(storageKey);

      if (!storedValue) {
        return loadStarterTemplates();
      }

      try {
        return normalizeStoredTemplates(JSON.parse(storedValue));
      } catch {
        return loadStarterTemplates();
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
