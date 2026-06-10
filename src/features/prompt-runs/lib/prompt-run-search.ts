import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';

interface MatchesPromptRunSearchInput {
  run: PromptRunRecord;
  sourceTemplateName: string;
  note: PromptRunNote | null;
  query: string;
}

function includesQuery(value: string, normalizedQuery: string) {
  return value.toLowerCase().includes(normalizedQuery);
}

export function matchesPromptRunSearch({
  run,
  sourceTemplateName,
  note,
  query,
}: MatchesPromptRunSearchInput) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return (
    includesQuery(run.templateName, normalizedQuery) ||
    includesQuery(sourceTemplateName, normalizedQuery) ||
    includesQuery(run.systemPrompt, normalizedQuery) ||
    includesQuery(run.userPrompt, normalizedQuery) ||
    Object.entries(run.variables).some(
      ([name, value]) =>
        includesQuery(name, normalizedQuery) ||
        includesQuery(value, normalizedQuery),
    ) ||
    (note ? includesQuery(note.body, normalizedQuery) : false)
  );
}
