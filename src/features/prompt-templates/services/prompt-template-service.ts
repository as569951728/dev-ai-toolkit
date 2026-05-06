import { createTemplateId } from '@/features/prompt-templates/lib/prompt-template-utils';
import { mergePromptTemplates } from '@/features/prompt-templates/lib/prompt-template-transfer';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type {
  PromptTemplate,
  PromptTemplateImportSummary,
  PromptTemplateInput,
} from '@/types/prompt-template';

export function sortPromptTemplates(templates: PromptTemplate[]) {
  return [...templates].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function collectPromptTemplateTags(templates: PromptTemplate[]) {
  return [...new Set(templates.flatMap((template) => template.tags))].sort();
}

function persistTemplates(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
) {
  repository.saveAll(templates);
  return templates;
}

export function createPromptTemplate(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  input: PromptTemplateInput,
) {
  const template: PromptTemplate = {
    ...input,
    id: createTemplateId(input.name),
    updatedAt: new Date().toISOString(),
  };

  const nextTemplates = persistTemplates(repository, [template, ...templates]);

  return {
    template,
    templates: nextTemplates,
  };
}

export function updatePromptTemplate(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  id: string,
  input: PromptTemplateInput,
) {
  let updatedTemplate: PromptTemplate | null = null;

  const nextTemplates = persistTemplates(
    repository,
    templates.map((template) => {
      if (template.id !== id) {
        return template;
      }

      updatedTemplate = {
        ...template,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      return updatedTemplate;
    }),
  );

  return {
    template: updatedTemplate,
    templates: nextTemplates,
  };
}

export function deletePromptTemplate(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  id: string,
) {
  return persistTemplates(
    repository,
    templates.filter((template) => template.id !== id),
  );
}

export function duplicatePromptTemplate(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  id: string,
) {
  const sourceTemplate = templates.find((template) => template.id === id) ?? null;

  if (!sourceTemplate) {
    return {
      template: null,
      templates,
    };
  }

  const duplicatedTemplate: PromptTemplate = {
    ...sourceTemplate,
    id: createTemplateId(`${sourceTemplate.name} copy`),
    name: `${sourceTemplate.name} Copy`,
    updatedAt: new Date().toISOString(),
  };

  const nextTemplates = persistTemplates(repository, [
    duplicatedTemplate,
    ...templates,
  ]);

  return {
    template: duplicatedTemplate,
    templates: nextTemplates,
  };
}

export function importPromptTemplates(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  importedTemplates: PromptTemplate[],
  summary: PromptTemplateImportSummary,
) {
  const nextTemplates = persistTemplates(
    repository,
    mergePromptTemplates(templates, importedTemplates),
  );

  return {
    summary,
    templates: nextTemplates,
  };
}
