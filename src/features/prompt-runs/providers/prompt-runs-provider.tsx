import { useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { PromptRunsContext, type PromptRunsContextValue } from '@/features/prompt-runs/providers/prompt-runs-context';
import { createLocalStoragePromptRunRepository } from '@/features/prompt-runs/repositories/local-storage-prompt-run-repository';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import {
  createPromptRunRecord,
  getRunsForTemplate,
  sortPromptRuns,
} from '@/features/prompt-runs/services/prompt-run-service';
import type { PromptRunRecord } from '@/types/prompt-run';

type PromptRunsProviderProps = PropsWithChildren<{
  repository?: PromptRunRepository;
}>;

export function PromptRunsProvider({
  children,
  repository: repositoryProp,
}: PromptRunsProviderProps) {
  const repository = useMemo(
    () => repositoryProp ?? createLocalStoragePromptRunRepository(),
    [repositoryProp],
  );
  const [runs, setRuns] = useState<PromptRunRecord[]>(() =>
    sortPromptRuns(repository.loadAll()),
  );

  const createRun = useCallback(
    (input: Omit<PromptRunRecord, 'id' | 'createdAt'>) => {
      const result = createPromptRunRecord(repository, runs, input);
      setRuns(result.runs);
      return result.record;
    },
    [repository, runs],
  );

  const getRunsByTemplateId = useCallback(
    (templateId: string, limit?: number) => getRunsForTemplate(runs, templateId, limit),
    [runs],
  );

  const value = useMemo<PromptRunsContextValue>(
    () => ({
      runs,
      createRun,
      getRunsByTemplateId,
    }),
    [runs, createRun, getRunsByTemplateId],
  );

  return (
    <PromptRunsContext.Provider value={value}>
      {children}
    </PromptRunsContext.Provider>
  );
}
