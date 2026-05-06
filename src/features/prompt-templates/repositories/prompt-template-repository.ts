import type { PromptTemplate } from '@/types/prompt-template';

export interface PromptTemplateRepository {
  loadAll: () => PromptTemplate[];
  saveAll: (templates: PromptTemplate[]) => void;
}
