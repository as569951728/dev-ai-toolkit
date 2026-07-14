import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import {
  PromptTemplatesContext,
  type PromptTemplatesContextValue,
} from '@/features/prompt-templates/providers/prompt-templates-context';
import {
  createLocalStoragePromptTemplateRepository,
  PROMPT_TEMPLATE_STORAGE_KEY,
} from '@/features/prompt-templates/repositories/local-storage-prompt-template-repository';
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
import { subscribeToStorageKey } from '@/lib/storage-sync';

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
  const templatesRef = useRef(templates);

  const commitTemplates = useCallback((nextTemplates: PromptTemplate[]) => {
    templatesRef.current = nextTemplates;
    setTemplates(nextTemplates);
  }, []);

  useEffect(() => {
    if (repositoryProp) {
      return;
    }

    return subscribeToStorageKey(PROMPT_TEMPLATE_STORAGE_KEY, () => {
      commitTemplates(repository.loadAll());
    });
  }, [commitTemplates, repository, repositoryProp]);

  const sortedTemplates = useMemo(() => sortPromptTemplates(templates), [templates]);

  const tags = useMemo(() => collectPromptTemplateTags(sortedTemplates), [sortedTemplates]);

  const createTemplate = useCallback(
    (input: PromptTemplateInput) => {
      const result = createPromptTemplate(
        repository,
        templatesRef.current,
        input,
      );
      commitTemplates(result.templates);
      return result.template;
    },
    [commitTemplates, repository],
  );

  const updateTemplate = useCallback(
    (id: string, input: PromptTemplateInput) => {
      const result = updatePromptTemplate(
        repository,
        templatesRef.current,
        id,
        input,
      );
      commitTemplates(result.templates);
      return result.template;
    },
    [commitTemplates, repository],
  );

  const archiveTemplate = useCallback(
    (id: string) => {
      const result = archivePromptTemplate(
        repository,
        templatesRef.current,
        id,
      );
      commitTemplates(result.templates);
      return result.template;
    },
    [commitTemplates, repository],
  );

  const restoreArchivedTemplate = useCallback(
    (id: string) => {
      const result = restoreArchivedPromptTemplate(
        repository,
        templatesRef.current,
        id,
      );
      commitTemplates(result.templates);
      return result.template;
    },
    [commitTemplates, repository],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      commitTemplates(
        deletePromptTemplate(repository, templatesRef.current, id),
      );
    },
    [commitTemplates, repository],
  );

  const duplicateTemplate = useCallback(
    (id: string) => {
      const result = duplicatePromptTemplate(
        repository,
        templatesRef.current,
        id,
      );
      commitTemplates(result.templates);
      return result.template;
    },
    [commitTemplates, repository],
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
        templatesRef.current,
        importedTemplates,
        summary,
      );
      commitTemplates(result.templates);
      return result.summary;
    },
    [commitTemplates, repository],
  );

  const replaceTemplates = useCallback(
    (nextTemplates: PromptTemplate[]) => {
      const templatesToPersist = [...nextTemplates];
      repository.saveAll(templatesToPersist);
      commitTemplates(templatesToPersist);
    },
    [commitTemplates, repository],
  );

  const restoreTemplateRevisionAction = useCallback(
    (templateId: string, revisionVersion: number) => {
      const result = restorePromptTemplateRevision(
        repository,
        templatesRef.current,
        templateId,
        revisionVersion,
      );
      commitTemplates(result.templates);
      return result.template;
    },
    [commitTemplates, repository],
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
      replaceTemplates,
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
      replaceTemplates,
      restoreTemplateRevisionAction,
    ],
  );

  return (
    <PromptTemplatesContext.Provider value={value}>
      {children}
    </PromptTemplatesContext.Provider>
  );
}
