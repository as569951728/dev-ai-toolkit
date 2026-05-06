import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type { PromptTemplate } from '@/types/prompt-template';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-templates';

function normalizeStoredTemplates(value: unknown) {
  return Array.isArray(value) && value.length > 0
    ? (value as PromptTemplate[])
    : mockPromptTemplates;
}

export function createLocalStoragePromptTemplateRepository(
  storageKey = STORAGE_KEY,
  storage = typeof window !== 'undefined' ? window.localStorage : null,
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

      storage.setItem(storageKey, JSON.stringify(templates));
    },
  };
}
