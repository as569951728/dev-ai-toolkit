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

export function getRunsForTemplate(
  runs: PromptRunRecord[],
  templateId: string,
  limit?: number,
) {
  const filtered = runs.filter((run) => run.templateId === templateId);
  return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
}
