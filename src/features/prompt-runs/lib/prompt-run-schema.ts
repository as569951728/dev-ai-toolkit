import type { PromptRunRecord } from '@/types/prompt-run';
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

function isVariablesRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (variableValue) => typeof variableValue === 'string',
    )
  );
}

export function isPromptRunRecord(value: unknown): value is PromptRunRecord {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.templateId) &&
    isNonEmptyString(value.templateName) &&
    isPositiveInteger(value.templateVersion) &&
    isVariablesRecord(value.variables) &&
    isNonEmptyString(value.systemPrompt) &&
    isNonEmptyString(value.userPrompt) &&
    isValidDateString(value.createdAt)
  );
}
