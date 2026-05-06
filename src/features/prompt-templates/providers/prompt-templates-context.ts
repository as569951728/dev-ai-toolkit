import { createContext } from 'react';

import type {
  PromptTemplate,
  PromptTemplateImportSummary,
  PromptTemplateInput,
  PromptTemplateRevision,
} from '@/types/prompt-template';

export interface PromptTemplatesContextValue {
  tags: string[];
  templates: PromptTemplate[];
  createTemplate: (input: PromptTemplateInput) => PromptTemplate;
  updateTemplate: (
    id: string,
    input: PromptTemplateInput,
  ) => PromptTemplate | null;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => PromptTemplate | null;
  getTemplateById: (id: string) => PromptTemplate | null;
  importTemplates: (
    importedTemplates: PromptTemplate[],
    summary: PromptTemplateImportSummary,
  ) => PromptTemplateImportSummary;
  restoreTemplateRevision: (
    templateId: string,
    revisionVersion: PromptTemplateRevision['version'],
  ) => PromptTemplate | null;
}

export const PromptTemplatesContext =
  createContext<PromptTemplatesContextValue | null>(null);
