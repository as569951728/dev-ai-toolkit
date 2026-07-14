import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { PromptRunsContext, type PromptRunsContextValue } from '@/features/prompt-runs/providers/prompt-runs-context';
import {
  createLocalStoragePromptRunRepository,
  PROMPT_RUN_STORAGE_KEY,
} from '@/features/prompt-runs/repositories/local-storage-prompt-run-repository';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import {
  createPromptRunRecord,
  deletePromptRunRecord,
  getPromptRunById,
  getRunsForTemplate,
  importPromptRunRecords,
  sortPromptRuns,
} from '@/features/prompt-runs/services/prompt-run-service';
import type { PromptRunRecord } from '@/types/prompt-run';
import { subscribeToStorageKey } from '@/lib/storage-sync';

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
  const runsRef = useRef(runs);

  const commitRuns = useCallback((nextRuns: PromptRunRecord[]) => {
    runsRef.current = nextRuns;
    setRuns(nextRuns);
  }, []);

  useEffect(() => {
    if (repositoryProp) {
      return;
    }

    return subscribeToStorageKey(PROMPT_RUN_STORAGE_KEY, () => {
      commitRuns(sortPromptRuns(repository.loadAll()));
    });
  }, [commitRuns, repository, repositoryProp]);

  const createRun = useCallback(
    (input: Omit<PromptRunRecord, 'id' | 'createdAt'>) => {
      const result = createPromptRunRecord(repository, runsRef.current, input);
      commitRuns(result.runs);
      return result.record;
    },
    [commitRuns, repository],
  );

  const deleteRun = useCallback(
    (runId: string) => {
      commitRuns(deletePromptRunRecord(repository, runsRef.current, runId));
    },
    [commitRuns, repository],
  );

  const importRuns = useCallback(
    (importedRuns: PromptRunRecord[]) => {
      commitRuns(
        importPromptRunRecords(repository, runsRef.current, importedRuns),
      );
    },
    [commitRuns, repository],
  );

  const replaceRuns = useCallback(
    (nextRuns: PromptRunRecord[]) => {
      const sortedRuns = sortPromptRuns(nextRuns);
      repository.saveAll(sortedRuns);
      commitRuns(sortedRuns);
    },
    [commitRuns, repository],
  );

  const getRunsByTemplateId = useCallback(
    (templateId: string, limit?: number) => getRunsForTemplate(runs, templateId, limit),
    [runs],
  );

  const getRunById = useCallback(
    (runId: string) => getPromptRunById(runs, runId),
    [runs],
  );

  const value = useMemo<PromptRunsContextValue>(
    () => ({
      runs,
      createRun,
      deleteRun,
      importRuns,
      replaceRuns,
      getRunById,
      getRunsByTemplateId,
    }),
    [
      runs,
      createRun,
      deleteRun,
      importRuns,
      replaceRuns,
      getRunById,
      getRunsByTemplateId,
    ],
  );

  return (
    <PromptRunsContext.Provider value={value}>
      {children}
    </PromptRunsContext.Provider>
  );
}
