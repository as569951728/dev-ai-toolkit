import { useMemo, useState } from 'react';

import {
  buildPromptPreview,
  extractVariables,
} from '@/features/prompt-playground/lib/prompt-playground-utils';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import type { PromptTemplate } from '@/types/prompt-template';

const STORAGE_KEY = 'dev-ai-toolkit.playground-recent-template-ids';
const MAX_RECENT_ITEMS = 5;

function loadRecentTemplateIds() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue) as string[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistRecentTemplateIds(templateIds: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templateIds));
}

function createInitialValues(template: PromptTemplate | null) {
  if (!template) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    extractVariables(template).map((variable) => [variable.key, '']),
  );
}

export function usePromptPlayground() {
  const { templates, getTemplateById } = usePromptTemplates();
  const defaultTemplate = templates[0] ?? null;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    defaultTemplate?.id ?? '',
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    () => createInitialValues(defaultTemplate),
  );
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>(() =>
    loadRecentTemplateIds(),
  );

  const activeTemplateId = selectedTemplateId || defaultTemplate?.id || '';

  const selectedTemplate = useMemo(
    () => getTemplateById(activeTemplateId) ?? defaultTemplate,
    [activeTemplateId, defaultTemplate, getTemplateById],
  );

  const variables = useMemo(
    () => (selectedTemplate ? extractVariables(selectedTemplate) : []),
    [selectedTemplate],
  );

  const preview = useMemo(
    () =>
      selectedTemplate
        ? buildPromptPreview(selectedTemplate, variableValues)
        : null,
    [selectedTemplate, variableValues],
  );

  const recentTemplates = useMemo(
    () =>
      recentTemplateIds
        .map((templateId) => getTemplateById(templateId))
        .filter((template): template is PromptTemplate => template !== null),
    [getTemplateById, recentTemplateIds],
  );

  return {
    selectedTemplate,
    selectedTemplateId: activeTemplateId,
    templates,
    variables,
    variableValues,
    preview,
    recentTemplates,
    setSelectedTemplateId: (nextTemplateId: string) => {
      const nextTemplate = getTemplateById(nextTemplateId);

      setSelectedTemplateId(nextTemplateId);
      setVariableValues((currentValues) => {
        if (!nextTemplate) {
          return {};
        }

        const nextEntries = extractVariables(nextTemplate).map((variable) => [
          variable.key,
          currentValues[variable.key] ?? '',
        ]);

        return Object.fromEntries(nextEntries);
      });
      setRecentTemplateIds((currentIds) => {
        const nextIds = [
          nextTemplateId,
          ...currentIds.filter((id) => id !== nextTemplateId),
        ].slice(0, MAX_RECENT_ITEMS);

        persistRecentTemplateIds(nextIds);

        return nextIds;
      });
    },
    updateVariableValue: (key: string, value: string) => {
      setVariableValues((currentValues) => ({
        ...currentValues,
        [key]: value,
      }));
    },
  };
}
