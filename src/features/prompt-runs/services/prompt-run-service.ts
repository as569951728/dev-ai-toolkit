import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

const MAX_RUNS = 20;

export function sortPromptRuns(runs: PromptRunRecord[]) {
  return [...runs].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function createPromptRunRecord(
  repository: PromptRunRepository,
  runs: PromptRunRecord[],
  input: Omit<PromptRunRecord, 'id' | 'createdAt'>,
) {
  const record: PromptRunRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const nextRuns = sortPromptRuns([record, ...runs]).slice(0, MAX_RUNS);
  repository.saveAll(nextRuns);

  return {
    record,
    runs: nextRuns,
  };
}

export function deletePromptRunRecord(
  repository: PromptRunRepository,
  runs: PromptRunRecord[],
  runId: string,
) {
  const nextRuns = runs.filter((run) => run.id !== runId);
  repository.saveAll(nextRuns);

  return nextRuns;
}

export function importPromptRunRecords(
  repository: PromptRunRepository,
  runs: PromptRunRecord[],
  importedRuns: PromptRunRecord[],
) {
  const nextRunsById = new Map(runs.map((run) => [run.id, run]));

  for (const run of importedRuns) {
    nextRunsById.set(run.id, run);
  }

  const nextRuns = sortPromptRuns([...nextRunsById.values()]);
  repository.saveAll(nextRuns);

  return nextRuns;
}

export function getRunsForTemplate(
  runs: PromptRunRecord[],
  templateId: string,
  limit?: number,
) {
  const filtered = runs.filter((run) => run.templateId === templateId);
  return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
}

export function getPromptRunById(
  runs: PromptRunRecord[],
  runId: string,
) {
  return runs.find((run) => run.id === runId);
}
