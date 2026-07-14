import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';
import { isValidDateString } from '@/lib/date-validation';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
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

  const currentVersion = value.version;
  const currentName = value.name;
  const currentDescription = value.description;
  const currentSystemPrompt = value.systemPrompt;
  const currentUserPrompt = value.userPrompt;
  const currentTags = value.tags;
  const revisionVersions = value.revisions.map((revision) => revision.version);
  const currentRevision = value.revisions.find(
    (revision) => revision.version === currentVersion,
  );

  return (
    currentRevision !== undefined &&
    revisionVersions.length === new Set(revisionVersions).size &&
    revisionVersions.every((revisionVersion) => revisionVersion <= currentVersion) &&
    currentRevision.name === currentName &&
    currentRevision.description === currentDescription &&
    currentRevision.systemPrompt === currentSystemPrompt &&
    currentRevision.userPrompt === currentUserPrompt &&
    currentRevision.tags.length === currentTags.length &&
    currentRevision.tags.every((tag, index) => tag === currentTags[index])
  );
}
