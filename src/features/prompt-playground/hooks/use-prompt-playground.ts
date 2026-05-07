import { useMemo, useState } from 'react';

import {
  buildPromptPreview,
  extractVariables,
} from '@/features/prompt-playground/lib/prompt-playground-utils';
import {
  loadRecentTemplateIds,
  saveRecentTemplateIds,
} from '@/features/prompt-playground/repositories/local-storage-recent-template-repository';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import type { PromptTemplate } from '@/types/prompt-template';

const MAX_RECENT_ITEMS = 5;

function createInitialValues(template: PromptTemplate | null) {
  if (!template) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    extractVariables(template).map((variable) => [variable.key, '']),
  );
}

export function usePromptPlayground(initialTemplateId?: string) {
  const { templates, getTemplateById } = usePromptTemplates();
  const defaultTemplate = templates[0] ?? null;
  const initialTemplate = initialTemplateId
    ? getTemplateById(initialTemplateId)
    : defaultTemplate;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplate?.id ?? defaultTemplate?.id ?? '',
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    () => createInitialValues(initialTemplate ?? defaultTemplate),
  );
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>(() =>
    loadRecentTemplateIds(),
  );

  const activeTemplateId =
    selectedTemplateId || initialTemplate?.id || defaultTemplate?.id || '';

  const selectedTemplate = useMemo(
    () => getTemplateById(activeTemplateId) ?? initialTemplate ?? defaultTemplate,
    [activeTemplateId, defaultTemplate, getTemplateById, initialTemplate],
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

        saveRecentTemplateIds(nextIds);

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
