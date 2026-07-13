import { describe, expect, it } from 'vitest';

import { isPromptRunNote } from '@/features/prompt-run-notes/lib/prompt-run-note-schema';
import type { PromptRunNote } from '@/types/prompt-run-note';

const note: PromptRunNote = {
  id: 'note-1',
  runId: 'run-1',
  body: 'Useful baseline for future UI reviews.',
  createdAt: '2026-05-04T08:00:00.000Z',
  updatedAt: '2026-05-04T08:00:00.000Z',
};

describe('prompt-run-note-schema', () => {
  it('accepts a complete prompt run note', () => {
    expect(isPromptRunNote(note)).toBe(true);
  });

  it.each([
    ['blank id', { ...note, id: '   ' }],
    ['blank run id', { ...note, runId: '   ' }],
    ['blank body', { ...note, body: '   ' }],
    ['invalid creation date', { ...note, createdAt: 'not-a-date' }],
    ['invalid update date', { ...note, updatedAt: 'not-a-date' }],
  ])('rejects a note with %s', (_label, candidate) => {
    expect(isPromptRunNote(candidate)).toBe(false);
  });
});
