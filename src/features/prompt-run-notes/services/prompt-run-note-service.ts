import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';

export function getNoteForRun(notes: PromptRunNote[], runId: string) {
  return notes.find((note) => note.runId === runId);
}

export function saveNoteForRun(
  repository: PromptRunNoteRepository,
  notes: PromptRunNote[],
  runId: string,
  body: string,
) {
  const existingNote = getNoteForRun(notes, runId);
  const now = new Date().toISOString();
  const note: PromptRunNote = existingNote
    ? {
        ...existingNote,
        body,
        updatedAt: now,
      }
    : {
        id: crypto.randomUUID(),
        runId,
        body,
        createdAt: now,
        updatedAt: now,
      };

  const nextNotes = existingNote
    ? notes.map((currentNote) =>
        currentNote.id === existingNote.id ? note : currentNote,
      )
    : [note, ...notes];

  repository.saveAll(nextNotes);

  return {
    note,
    notes: nextNotes,
  };
}
