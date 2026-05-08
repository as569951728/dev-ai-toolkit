import type { PromptRunNote } from '@/types/prompt-run-note';

export interface PromptRunNoteRepository {
  loadAll: () => PromptRunNote[];
  saveAll: (notes: PromptRunNote[]) => void;
}
