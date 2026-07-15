import { ensurePromptTemplateVersioning } from '@/features/prompt-templates/lib/prompt-template-versioning';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';
import {
  resolveBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';
import {
  assertLocalStorageKeyWritable,
  clearLocalStorageReadIssue,
  decodeLocalStorageValue,
  type LocalStorageDecodeResult,
} from '@/lib/local-storage-recovery';

export const PROMPT_TEMPLATE_STORAGE_KEY = 'dev-ai-toolkit.prompt-templates';

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

function hasInvalidOptionalTemplateData(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  const hasInvalidArchivedAt =
    value.archivedAt !== undefined &&
    value.archivedAt !== null &&
    typeof value.archivedAt !== 'string';
  const hasInvalidVersion =
    value.version !== undefined && typeof value.version !== 'number';
  const hasInvalidRevisions =
    value.revisions !== undefined &&
    (!Array.isArray(value.revisions) ||
      value.revisions.some((revision) => !isValidStoredRevision(revision)));

  return hasInvalidArchivedAt || hasInvalidVersion || hasInvalidRevisions;
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
    id: value.id.trim(),
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

function normalizeStoredTemplates(
  value: unknown,
): LocalStorageDecodeResult<PromptTemplate[]> | null {
  const templates = readVersionedCollection<unknown>(value);

  if (!templates) {
    return null;
  }

  const normalizedEntries = templates.map((template) => ({
    hasInvalidOptionalData: hasInvalidOptionalTemplateData(template),
    template: normalizeStoredTemplate(template),
  }));
  const normalizedTemplates = normalizedEntries
    .map((entry) => entry.template)
    .filter((template): template is PromptTemplate => template !== null);

  return {
    recovered:
      normalizedTemplates.length !== templates.length ||
      normalizedEntries.some((entry) => entry.hasInvalidOptionalData),
    value: keepLastByKey(normalizedTemplates, (template) => template.id),
  };
}

export function createLocalStoragePromptTemplateRepository(
  storageKey = PROMPT_TEMPLATE_STORAGE_KEY,
  storage: StorageLike | null = resolveBrowserStorage(),
): PromptTemplateRepository {
  return {
    loadAll() {
      if (!storage) {
        return loadStarterTemplates();
      }

      let storedValue: string | null;

      try {
        storedValue = storage.getItem(storageKey);
      } catch {
        return loadStarterTemplates();
      }

      if (storedValue === null) {
        clearLocalStorageReadIssue(storageKey);
        return loadStarterTemplates();
      }

      return (
        decodeLocalStorageValue({
          decode: normalizeStoredTemplates,
          label: 'Prompt templates',
          rawValue: storedValue,
          storageKey,
        }) ?? loadStarterTemplates()
      );
    },
    saveAll(templates: PromptTemplate[]) {
      if (!storage) {
        return;
      }

      assertLocalStorageKeyWritable(storageKey);
      storage.setItem(
        storageKey,
        JSON.stringify(writeVersionedCollection(templates)),
      );
    },
  };
}
