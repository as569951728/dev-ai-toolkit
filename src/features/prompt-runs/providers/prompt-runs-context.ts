import { createContext } from 'react';

import type { PromptRunRecord } from '@/types/prompt-run';

export interface PromptRunsContextValue {
  runs: PromptRunRecord[];
  createRun: (
    input: Omit<PromptRunRecord, 'id' | 'createdAt'>,
  ) => PromptRunRecord;
  getRunsByTemplateId: (templateId: string, limit?: number) => PromptRunRecord[];
}

export const PromptRunsContext = createContext<PromptRunsContextValue | null>(
  null,
);
