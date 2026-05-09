import { createContext } from 'react';

import type { PromptRunRecord } from '@/types/prompt-run';

export interface PromptRunsContextValue {
  runs: PromptRunRecord[];
  createRun: (
    input: Omit<PromptRunRecord, 'id' | 'createdAt'>,
  ) => PromptRunRecord;
  deleteRun: (runId: string) => void;
  getRunById: (runId: string) => PromptRunRecord | undefined;
  getRunsByTemplateId: (templateId: string, limit?: number) => PromptRunRecord[];
}

export const PromptRunsContext = createContext<PromptRunsContextValue | null>(
  null,
);
