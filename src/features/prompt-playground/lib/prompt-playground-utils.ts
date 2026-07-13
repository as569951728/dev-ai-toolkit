import {
  extractPromptVariableKeys,
  replacePromptVariablePlaceholders,
} from '@/lib/prompt-variables';
import type { PromptTemplate } from '@/types/prompt-template';

export interface PromptPlaygroundVariable {
  key: string;
  label: string;
}

export function extractVariables(template: PromptTemplate) {
  return extractPromptVariableKeys(
    template.systemPrompt,
    template.userPrompt,
  ).map<PromptPlaygroundVariable>((key) => ({
    key,
    label: key
      .split(/[._-]/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }));
}

export function applyVariables(
  source: string,
  values: Record<string, string>,
) {
  return replacePromptVariablePlaceholders(source, (key) => {
    return values[key] && values[key].trim() ? values[key].trim() : `{{${key}}}`;
  });
}

export function countUnresolvedVariables(
  variables: PromptPlaygroundVariable[],
  values: Record<string, string>,
) {
  return variables.filter((variable) => !values[variable.key]?.trim()).length;
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
