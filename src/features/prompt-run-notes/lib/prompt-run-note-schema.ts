import type { PromptRunNote } from '@/types/prompt-run-note';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
}

export function isPromptRunNote(value: unknown): value is PromptRunNote {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.runId) &&
    isNonEmptyString(value.body) &&
    isValidDateString(value.createdAt) &&
    isValidDateString(value.updatedAt)
  );
}
