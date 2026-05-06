import type { PromptRunRecord } from '@/types/prompt-run';

export interface PromptRunRepository {
  loadAll: () => PromptRunRecord[];
  saveAll: (runs: PromptRunRecord[]) => void;
}
