import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { usePromptRunWorkflowActions } from '@/features/prompt-workflows/hooks/use-prompt-run-workflow-actions';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';

function createRunRepository(
  initialRuns: PromptRunRecord[] = [],
): PromptRunRepository & { snapshot: () => PromptRunRecord[] } {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
    snapshot: () => [...runs],
  };
}

function createNoteRepository(
  initialNotes: PromptRunNote[] = [],
): PromptRunNoteRepository & { snapshot: () => PromptRunNote[] } {
  let notes = [...initialNotes];

  return {
    loadAll: () => [...notes],
    saveAll: (nextNotes) => {
      notes = [...nextNotes];
    },
    snapshot: () => [...notes],
  };
}

function TestConsumer({ runId }: { runId: string }) {
  const { deleteRunWithRelatedData } = usePromptRunWorkflowActions();

  return (
    <button type="button" onClick={() => deleteRunWithRelatedData(runId)}>
      Delete workflow run
    </button>
  );
}

describe('usePromptRunWorkflowActions', () => {
  it('deletes a prompt run and its saved note together', () => {
    const runRepository = createRunRepository([
      {
        id: 'run-1',
        templateId: 'template-1',
        templateName: 'Code Review Assistant',
        templateVersion: 2,
        variables: {},
        systemPrompt: 'System',
        userPrompt: 'User',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);
    const noteRepository = createNoteRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Keep this context until the run is deleted.',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    render(
      <PromptRunsProvider repository={runRepository}>
        <PromptRunNotesProvider repository={noteRepository}>
          <TestConsumer runId="run-1" />
        </PromptRunNotesProvider>
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete workflow run' }));

    expect(runRepository.snapshot()).toEqual([]);
    expect(noteRepository.snapshot()).toEqual([]);
  });
});
