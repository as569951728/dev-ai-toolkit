import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isPromptTemplateRevision(
  value: unknown,
): value is PromptTemplateRevision {
  return (
    isRecord(value) &&
    isPositiveInteger(value.version) &&
    isValidDateString(value.updatedAt) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.systemPrompt) &&
    isNonEmptyString(value.userPrompt) &&
    isStringArray(value.tags)
  );
}

export function isPromptTemplate(value: unknown): value is PromptTemplate {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.description) ||
    !isNonEmptyString(value.systemPrompt) ||
    !isNonEmptyString(value.userPrompt) ||
    !isStringArray(value.tags) ||
    !isPositiveInteger(value.version) ||
    !Array.isArray(value.revisions) ||
    !value.revisions.every(isPromptTemplateRevision) ||
    !(isValidDateString(value.archivedAt) || value.archivedAt === null) ||
    !isValidDateString(value.updatedAt)
  ) {
    return false;
  }

  const revisionVersions = value.revisions.map((revision) => revision.version);

  return (
    revisionVersions.includes(value.version) &&
    revisionVersions.length === new Set(revisionVersions).size
  );
}
