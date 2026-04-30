import { useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createTemplateId } from '@/features/prompt-templates/lib/prompt-template-utils';
import { mergePromptTemplates } from '@/features/prompt-templates/lib/prompt-template-transfer';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import {
  PromptTemplatesContext,
  type PromptTemplatesContextValue,
} from '@/features/prompt-templates/providers/prompt-templates-context';
import type {
  PromptTemplate,
  PromptTemplateImportSummary,
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

export function PromptTemplatesProvider({ children }: PropsWithChildren) {
  const [templates, setTemplates] = useState<PromptTemplate[]>(() =>
    loadPromptTemplates(),
  );

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime(),
      ),
    [templates],
  );

  const tags = useMemo(
    () =>
      [...new Set(sortedTemplates.flatMap((template) => template.tags))].sort(),
    [sortedTemplates],
  );

  const createTemplate = useCallback((input: PromptTemplateInput) => {
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
  }, []);

  const updateTemplate = useCallback((id: string, input: PromptTemplateInput) => {
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
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((currentTemplates) => {
      const nextTemplates = currentTemplates.filter(
        (template) => template.id !== id,
      );
      persistPromptTemplates(nextTemplates);

      return nextTemplates;
    });
  }, []);

  const duplicateTemplate = useCallback(
    (id: string) => {
      const sourceTemplate =
        templates.find((template) => template.id === id) ?? null;

      if (!sourceTemplate) {
        return null;
      }

      const duplicatedTemplate: PromptTemplate = {
        ...sourceTemplate,
        id: createTemplateId(`${sourceTemplate.name} copy`),
        name: `${sourceTemplate.name} Copy`,
        updatedAt: new Date().toISOString(),
      };

      setTemplates((currentTemplates) => {
        const nextTemplates = [duplicatedTemplate, ...currentTemplates];
        persistPromptTemplates(nextTemplates);

        return nextTemplates;
      });

      return duplicatedTemplate;
    },
    [templates],
  );

  const getTemplateById = useCallback(
    (id: string) => templates.find((template) => template.id === id) ?? null,
    [templates],
  );

  const importTemplates = useCallback(
    (
      importedTemplates: PromptTemplate[],
      summary: PromptTemplateImportSummary,
    ) => {
      setTemplates((currentTemplates) => {
        const nextTemplates = mergePromptTemplates(
          currentTemplates,
          importedTemplates,
        );
        persistPromptTemplates(nextTemplates);

        return nextTemplates;
      });

      return summary;
    },
    [],
  );

  const value = useMemo<PromptTemplatesContextValue>(
    () => ({
      tags,
      templates: sortedTemplates,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      duplicateTemplate,
      getTemplateById,
      importTemplates,
    }),
    [
      tags,
      sortedTemplates,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      duplicateTemplate,
      getTemplateById,
      importTemplates,
    ],
  );

  return (
    <PromptTemplatesContext.Provider value={value}>
      {children}
    </PromptTemplatesContext.Provider>
  );
}
