export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  tags: string[];
  updatedAt: string;
}

export interface PromptTemplateInput {
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  tags: string[];
}

export interface PromptTemplateFilters {
  search: string;
  tag: string;
}

export interface PromptTemplateImportSummary {
  created: number;
  updated: number;
  total: number;
}
