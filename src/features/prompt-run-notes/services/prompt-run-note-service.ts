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
  const normalizedBody = body.trim();

  if (!normalizedBody) {
    const nextNotes = notes.filter((note) => note.runId !== runId);
    repository.saveAll(nextNotes);

    return {
      note: null,
      notes: nextNotes,
    };
  }

  const now = new Date().toISOString();
  const note: PromptRunNote = existingNote
    ? {
        ...existingNote,
        body: normalizedBody,
        updatedAt: now,
      }
    : {
        id: crypto.randomUUID(),
        runId,
        body: normalizedBody,
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

export function deleteNoteForRun(
  repository: PromptRunNoteRepository,
  notes: PromptRunNote[],
  runId: string,
) {
  const nextNotes = notes.filter((note) => note.runId !== runId);
  repository.saveAll(nextNotes);

  return nextNotes;
}

export function importPromptRunNotes(
  repository: PromptRunNoteRepository,
  notes: PromptRunNote[],
  importedNotes: PromptRunNote[],
) {
  const nextNotesById = new Map(notes.map((note) => [note.id, note]));

  for (const note of importedNotes) {
    nextNotesById.set(note.id, note);
  }

  const nextNotes = [...nextNotesById.values()];
  repository.saveAll(nextNotes);

  return nextNotes;
}
