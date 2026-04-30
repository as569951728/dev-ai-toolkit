import type { PromptTemplate } from '@/types/prompt-template';

export interface PromptPlaygroundVariable {
  key: string;
  label: string;
}

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g;

export function extractVariables(template: PromptTemplate) {
  const variables = new Set<string>();

  for (const source of [template.systemPrompt, template.userPrompt]) {
    for (const match of source.matchAll(VARIABLE_PATTERN)) {
      const variableKey = match[1]?.trim();

      if (variableKey) {
        variables.add(variableKey);
      }
    }
  }

  return [...variables].map<PromptPlaygroundVariable>((key) => ({
    key,
    label: key
      .split(/[-_]/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }));
}

export function applyVariables(
  source: string,
  values: Record<string, string>,
) {
  return source.replaceAll(VARIABLE_PATTERN, (_, rawKey: string) => {
    const key = rawKey.trim();

    return values[key] && values[key].trim() ? values[key].trim() : `{{${key}}}`;
  });
}

export function buildPromptPreview(
  template: PromptTemplate,
  values: Record<string, string>,
) {
  return {
    systemPrompt: applyVariables(template.systemPrompt, values),
    userPrompt: applyVariables(template.userPrompt, values),
  };
}
