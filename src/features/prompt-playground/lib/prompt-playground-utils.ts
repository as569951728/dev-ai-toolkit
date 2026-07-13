import {
  extractPromptVariableKeys,
  replacePromptVariablePlaceholders,
} from '@/lib/prompt-variables';
import type { PromptTemplate } from '@/types/prompt-template';

export interface PromptPlaygroundVariable {
  key: string;
  label: string;
}

function formatVariableLabel(key: string) {
  return key
    .split(/[._-]/g)
    .flatMap((segment) =>
      segment
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .split(' '),
    )
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function extractVariables(template: PromptTemplate) {
  return extractPromptVariableKeys(
    template.systemPrompt,
    template.userPrompt,
  ).map<PromptPlaygroundVariable>((key) => ({
    key,
    label: formatVariableLabel(key),
  }));
}

export function applyVariables(
  source: string,
  values: Record<string, string>,
) {
  return replacePromptVariablePlaceholders(source, (key) => {
    const value = values[key];

    return value?.trim() ? value : `{{${key}}}`;
  });
}

export function countUnresolvedVariables(
  variables: PromptPlaygroundVariable[],
  values: Record<string, string>,
) {
  return getUnresolvedVariables(variables, values).length;
}

export function getUnresolvedVariables(
  variables: PromptPlaygroundVariable[],
  values: Record<string, string>,
) {
  return variables.filter((variable) => !values[variable.key]?.trim());
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
