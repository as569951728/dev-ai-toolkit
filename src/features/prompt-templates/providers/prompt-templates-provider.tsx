import { useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import {
  PromptTemplatesContext,
  type PromptTemplatesContextValue,
} from '@/features/prompt-templates/providers/prompt-templates-context';
import { createLocalStoragePromptTemplateRepository } from '@/features/prompt-templates/repositories/local-storage-prompt-template-repository';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import {
  archivePromptTemplate,
  collectPromptTemplateTags,
  createPromptTemplate,
  deletePromptTemplate,
  duplicatePromptTemplate,
  importPromptTemplates,
  restoreArchivedPromptTemplate,
  restorePromptTemplateRevision,
  sortPromptTemplates,
  updatePromptTemplate,
} from '@/features/prompt-templates/services/prompt-template-service';
import type {
  PromptTemplate,
  PromptTemplateImportSummary,
  PromptTemplateInput,
} from '@/types/prompt-template';

type PromptTemplatesProviderProps = PropsWithChildren<{
  repository?: PromptTemplateRepository;
}>;

export function PromptTemplatesProvider({
  children,
  repository: repositoryProp,
}: PromptTemplatesProviderProps) {
  const repository = useMemo(
    () => repositoryProp ?? createLocalStoragePromptTemplateRepository(),
    [repositoryProp],
  );
  const [templates, setTemplates] = useState<PromptTemplate[]>(() =>
    repository.loadAll(),
  );

  const sortedTemplates = useMemo(() => sortPromptTemplates(templates), [templates]);

  const tags = useMemo(() => collectPromptTemplateTags(sortedTemplates), [sortedTemplates]);

  const createTemplate = useCallback((input: PromptTemplateInput) => {
    const result = createPromptTemplate(repository, templates, input);
    setTemplates(result.templates);
    return result.template;
  }, [repository, templates]);

  const updateTemplate = useCallback((id: string, input: PromptTemplateInput) => {
    const result = updatePromptTemplate(repository, templates, id, input);
    setTemplates(result.templates);
    return result.template;
  }, [repository, templates]);

  const archiveTemplate = useCallback((id: string) => {
    const result = archivePromptTemplate(repository, templates, id);
    setTemplates(result.templates);
    return result.template;
  }, [repository, templates]);

  const restoreArchivedTemplate = useCallback((id: string) => {
    const result = restoreArchivedPromptTemplate(repository, templates, id);
    setTemplates(result.templates);
    return result.template;
  }, [repository, templates]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(deletePromptTemplate(repository, templates, id));
  }, [repository, templates]);

  const duplicateTemplate = useCallback(
    (id: string) => {
      const result = duplicatePromptTemplate(repository, templates, id);
      setTemplates(result.templates);
      return result.template;
    },
    [repository, templates],
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
      const result = importPromptTemplates(
        repository,
        templates,
        importedTemplates,
        summary,
      );
      setTemplates(result.templates);
      return result.summary;
    },
    [repository, templates],
  );

  const restoreTemplateRevisionAction = useCallback(
    (templateId: string, revisionVersion: number) => {
      const result = restorePromptTemplateRevision(
        repository,
        templates,
        templateId,
        revisionVersion,
      );
      setTemplates(result.templates);
      return result.template;
    },
    [repository, templates],
  );

  const value = useMemo<PromptTemplatesContextValue>(
    () => ({
      tags,
      templates: sortedTemplates,
      createTemplate,
      updateTemplate,
      archiveTemplate,
      restoreArchivedTemplate,
      deleteTemplate,
      duplicateTemplate,
      getTemplateById,
      importTemplates,
      restoreTemplateRevision: restoreTemplateRevisionAction,
    }),
    [
      tags,
      sortedTemplates,
      createTemplate,
      updateTemplate,
      archiveTemplate,
      restoreArchivedTemplate,
      deleteTemplate,
      duplicateTemplate,
      getTemplateById,
      importTemplates,
      restoreTemplateRevisionAction,
    ],
  );

  return (
    <PromptTemplatesContext.Provider value={value}>
      {children}
    </PromptTemplatesContext.Provider>
  );
}
