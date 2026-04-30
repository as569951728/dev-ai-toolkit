import { useMemo, useState } from 'react';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import type {
  PromptTemplate,
  PromptTemplateInput,
} from '@/types/prompt-template';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-templates';

function loadPromptTemplates(): PromptTemplate[] {
  if (typeof window === 'undefined') {
    return mockPromptTemplates;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return mockPromptTemplates;
  }

  try {
    const parsed = JSON.parse(storedValue) as PromptTemplate[];

    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : mockPromptTemplates;
  } catch {
    return mockPromptTemplates;
  }
}

function persistPromptTemplates(templates: PromptTemplate[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function createTemplateId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || `prompt-${Date.now()}`;
}

export function usePromptTemplates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>(() =>
    loadPromptTemplates(),
  );

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [templates],
  );

  const createTemplate = (input: PromptTemplateInput) => {
    const template: PromptTemplate = {
      ...input,
      id: createTemplateId(input.name),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((currentTemplates) => {
      const nextTemplates = [template, ...currentTemplates];
      persistPromptTemplates(nextTemplates);

      return nextTemplates;
    });

    return template;
  };

  const updateTemplate = (id: string, input: PromptTemplateInput) => {
    let updatedTemplate: PromptTemplate | null = null;

    setTemplates((currentTemplates) => {
      const nextTemplates = currentTemplates.map((template) => {
        if (template.id !== id) {
          return template;
        }

        updatedTemplate = {
          ...template,
          ...input,
          updatedAt: new Date().toISOString(),
        };

        return updatedTemplate;
      });

      persistPromptTemplates(nextTemplates);

      return nextTemplates;
    });

    return updatedTemplate;
  };

  const getTemplateById = (id: string) =>
    templates.find((template) => template.id === id) ?? null;

  return {
    templates: sortedTemplates,
    createTemplate,
    updateTemplate,
    getTemplateById,
  };
}
