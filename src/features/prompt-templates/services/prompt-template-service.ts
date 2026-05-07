import { createTemplateId } from '@/features/prompt-templates/lib/prompt-template-utils';
import {
  buildPromptTemplateFromInput,
  createPromptTemplateRevision,
  toPromptTemplateInput,
} from '@/features/prompt-templates/lib/prompt-template-versioning';
import { mergePromptTemplates } from '@/features/prompt-templates/lib/prompt-template-transfer';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type {
  PromptTemplate,
  PromptTemplateImportSummary,
  PromptTemplateRevision,
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
  const updatedAt = new Date().toISOString();
  const template = buildPromptTemplateFromInput({
    id: createTemplateId(input.name),
    input,
    version: 1,
    updatedAt,
  });

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

      const updatedAt = new Date().toISOString();
      const version = template.version + 1;

      updatedTemplate = buildPromptTemplateFromInput({
        id: template.id,
        input,
        version,
        updatedAt,
        archivedAt: template.archivedAt,
        revisions: [
          ...template.revisions,
          createPromptTemplateRevision(input, version, updatedAt),
        ],
      });

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

  const updatedAt = new Date().toISOString();
  const duplicatedTemplate = buildPromptTemplateFromInput({
    id: createTemplateId(`${sourceTemplate.name} copy`),
    input: {
      ...toPromptTemplateInput(sourceTemplate),
      name: `${sourceTemplate.name} Copy`,
    },
    version: 1,
    updatedAt,
    archivedAt: null,
  });

  const nextTemplates = persistTemplates(repository, [
    duplicatedTemplate,
    ...templates,
  ]);

  return {
    template: duplicatedTemplate,
    templates: nextTemplates,
  };
}

export function archivePromptTemplate(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  id: string,
): {
  template: PromptTemplate | null;
  templates: PromptTemplate[];
} {
  let archivedTemplate: PromptTemplate | null = null;

  const nextTemplates = persistTemplates(
    repository,
    templates.map((template) => {
      if (template.id !== id || template.archivedAt) {
        return template;
      }

      archivedTemplate = {
        ...template,
        archivedAt: new Date().toISOString(),
      };

      return archivedTemplate;
    }),
  );

  return {
    template: archivedTemplate,
    templates: nextTemplates,
  };
}

export function restoreArchivedPromptTemplate(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  id: string,
): {
  template: PromptTemplate | null;
  templates: PromptTemplate[];
} {
  let restoredTemplate: PromptTemplate | null = null;

  const nextTemplates = persistTemplates(
    repository,
    templates.map((template) => {
      if (template.id !== id || !template.archivedAt) {
        return template;
      }

      restoredTemplate = {
        ...template,
        archivedAt: null,
      };

      return restoredTemplate;
    }),
  );

  return {
    template: restoredTemplate,
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

export function restorePromptTemplateRevision(
  repository: PromptTemplateRepository,
  templates: PromptTemplate[],
  templateId: string,
  revisionVersion: number,
) {
  let restoredTemplate: PromptTemplate | null = null;

  const nextTemplates = persistTemplates(
    repository,
    templates.map((template) => {
      if (template.id !== templateId) {
        return template;
      }

      const sourceRevision =
        template.revisions.find((revision) => revision.version === revisionVersion) ??
        null;

      if (!sourceRevision) {
        return template;
      }

      const nextVersion = template.version + 1;
      const updatedAt = new Date().toISOString();
      const nextInput: PromptTemplateInput = {
        name: sourceRevision.name,
        description: sourceRevision.description,
        systemPrompt: sourceRevision.systemPrompt,
        userPrompt: sourceRevision.userPrompt,
        tags: sourceRevision.tags,
      };
      const nextRevision: PromptTemplateRevision = createPromptTemplateRevision(
        nextInput,
        nextVersion,
        updatedAt,
      );

      restoredTemplate = buildPromptTemplateFromInput({
        id: template.id,
        input: nextInput,
        version: nextVersion,
        updatedAt,
        archivedAt: template.archivedAt,
        revisions: [...template.revisions, nextRevision],
      });

      return restoredTemplate;
    }),
  );

  return {
    template: restoredTemplate,
    templates: nextTemplates,
  };
}
