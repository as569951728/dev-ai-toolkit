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

function findTemplateById(templates: PromptTemplate[], templateId: string) {
  return templates.find((template) => template.id === templateId) ?? null;
}

function createInitialValues(template: PromptTemplate | null) {
  if (!template) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    extractVariables(template).map((variable) => [variable.key, '']),
  );
}

export function usePromptPlayground(initialTemplateId?: string) {
  const { templates } = usePromptTemplates();
  const activeTemplates = useMemo(
    () => templates.filter((template) => !template.archivedAt),
    [templates],
  );
  const defaultTemplate = activeTemplates[0] ?? null;
  const initialTemplate = initialTemplateId
    ? findTemplateById(activeTemplates, initialTemplateId)
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
    () =>
      findTemplateById(activeTemplates, activeTemplateId) ??
      initialTemplate ??
      defaultTemplate,
    [activeTemplateId, activeTemplates, defaultTemplate, initialTemplate],
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
        .map((templateId) => findTemplateById(activeTemplates, templateId))
        .filter((template): template is PromptTemplate => template !== null),
    [activeTemplates, recentTemplateIds],
  );

  const markTemplateAsRecent = (templateId: string) => {
    const template = findTemplateById(activeTemplates, templateId);

    if (!template) {
      return;
    }

    setRecentTemplateIds((currentIds) => {
      const nextIds = [
        templateId,
        ...currentIds.filter((id) => id !== templateId),
      ].slice(0, MAX_RECENT_ITEMS);

      saveRecentTemplateIds(nextIds);

      return nextIds;
    });
  };

  return {
    selectedTemplate,
    selectedTemplateId: activeTemplateId,
    templates: activeTemplates,
    variables,
    variableValues,
    preview,
    recentTemplates,
    setSelectedTemplateId: (nextTemplateId: string) => {
      const nextTemplate = findTemplateById(activeTemplates, nextTemplateId);

      if (!nextTemplate) {
        return;
      }

      setSelectedTemplateId(nextTemplateId);
      setVariableValues((currentValues) => {
        const nextEntries = extractVariables(nextTemplate).map((variable) => [
          variable.key,
          currentValues[variable.key] ?? '',
        ]);

        return Object.fromEntries(nextEntries);
      });
      markTemplateAsRecent(nextTemplateId);
    },
    markTemplateAsRecent,
    updateVariableValue: (key: string, value: string) => {
      setVariableValues((currentValues) => ({
        ...currentValues,
        [key]: value,
      }));
    },
  };
}
