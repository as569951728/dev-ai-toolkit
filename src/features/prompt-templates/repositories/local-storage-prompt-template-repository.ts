import { ensurePromptTemplateVersioning } from '@/features/prompt-templates/lib/prompt-template-versioning';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-templates';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidStoredRevision(
  value: unknown,
): value is PromptTemplateRevision {
  return (
    isRecord(value) &&
    typeof value.version === 'number' &&
    isNonEmptyString(value.updatedAt) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.systemPrompt) &&
    isNonEmptyString(value.userPrompt) &&
    isStringArray(value.tags)
  );
}

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

function normalizeStoredTemplate(value: unknown): PromptTemplate | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.description) ||
    !isNonEmptyString(value.systemPrompt) ||
    !isNonEmptyString(value.userPrompt) ||
    !isStringArray(value.tags) ||
    !isNonEmptyString(value.updatedAt)
  ) {
    return null;
  }

  const revisions = Array.isArray(value.revisions)
    ? value.revisions.filter(isValidStoredRevision)
    : undefined;

  return ensurePromptTemplateVersioning({
    id: value.id,
    name: value.name,
    description: value.description,
    systemPrompt: value.systemPrompt,
    userPrompt: value.userPrompt,
    tags: value.tags,
    updatedAt: value.updatedAt,
    archivedAt:
      typeof value.archivedAt === 'string' || value.archivedAt === null
        ? value.archivedAt
        : undefined,
    version: typeof value.version === 'number' ? value.version : undefined,
    revisions,
  });
}

function normalizeStoredTemplates(value: unknown) {
  const templates = readVersionedCollection<unknown>(value);

  if (!templates) {
    return loadStarterTemplates();
  }

  const normalizedTemplates = templates
    .map((template) => normalizeStoredTemplate(template))
    .filter((template): template is PromptTemplate => template !== null);

  return keepLastByKey(normalizedTemplates, (template) => template.id);
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
