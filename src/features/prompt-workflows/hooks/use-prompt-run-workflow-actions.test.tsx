import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import {
  PromptRunNoteRollbackError,
  usePromptRunWorkflowActions,
} from '@/features/prompt-workflows/hooks/use-prompt-run-workflow-actions';
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

function TestConsumer({
  runId,
  onError,
}: {
  runId: string;
  onError?: (error: unknown) => void;
}) {
  const { deleteRunWithRelatedData } = usePromptRunWorkflowActions();
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          try {
            deleteRunWithRelatedData(runId);
          } catch (error) {
            onError?.(error);
            setErrorMessage(
              error instanceof PromptRunNoteRollbackError
                ? error.message
                : 'Delete failed.',
            );
          }
        }}
      >
        Delete workflow run
      </button>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe('usePromptRunWorkflowActions', () => {
  it('deletes a run without writing the note collection when no note exists', () => {
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
    const noteRepository: PromptRunNoteRepository = {
      loadAll: () => [],
      saveAll: () => {
        throw new Error('Unexpected note write.');
      },
    };

    render(
      <PromptRunsProvider repository={runRepository}>
        <PromptRunNotesProvider repository={noteRepository}>
          <TestConsumer runId="run-1" />
        </PromptRunNotesProvider>
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete workflow run' }));

    expect(runRepository.snapshot()).toEqual([]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

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

  it('restores the note when deleting the run fails', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      templateVersion: 2,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const note: PromptRunNote = {
      id: 'note-1',
      runId: 'run-1',
      body: 'Keep this context if deletion fails.',
      createdAt: '2026-05-08T09:00:00.000Z',
      updatedAt: '2026-05-08T09:00:00.000Z',
    };
    const runRepository: PromptRunRepository & {
      snapshot: () => PromptRunRecord[];
    } = {
      loadAll: () => [run],
      saveAll: () => {
        throw new Error('Storage quota exceeded.');
      },
      snapshot: () => [run],
    };
    const noteRepository = createNoteRepository([note]);

    render(
      <PromptRunsProvider repository={runRepository}>
        <PromptRunNotesProvider repository={noteRepository}>
          <TestConsumer runId="run-1" />
        </PromptRunNotesProvider>
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete workflow run' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Delete failed.');
    expect(runRepository.snapshot()).toEqual([run]);
    expect(noteRepository.snapshot()).toEqual([note]);
  });

  it('reports when the note cannot be restored after run deletion fails', () => {
    const run: PromptRunRecord = {
      id: 'run-1',
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      templateVersion: 2,
      variables: {},
      systemPrompt: 'System',
      userPrompt: 'User',
      createdAt: '2026-05-07T09:00:00.000Z',
    };
    const note: PromptRunNote = {
      id: 'note-1',
      runId: 'run-1',
      body: 'This note cannot be restored.',
      createdAt: '2026-05-08T09:00:00.000Z',
      updatedAt: '2026-05-08T09:00:00.000Z',
    };
    const runRepository: PromptRunRepository = {
      loadAll: () => [run],
      saveAll: () => {
        throw new Error('Run deletion failed.');
      },
    };
    let notes = [note];
    const noteRepository: PromptRunNoteRepository & {
      snapshot: () => PromptRunNote[];
    } = {
      loadAll: () => [...notes],
      saveAll: (nextNotes) => {
        if (nextNotes.length > 0) {
          throw new Error('Note rollback failed.');
        }

        notes = [...nextNotes];
      },
      snapshot: () => [...notes],
    };
    const onError = vi.fn();

    render(
      <PromptRunsProvider repository={runRepository}>
        <PromptRunNotesProvider repository={noteRepository}>
          <TestConsumer runId="run-1" onError={onError} />
        </PromptRunNotesProvider>
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete workflow run' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The prompt snapshot could not be deleted, and its note could not be restored.',
    );
    const workflowError = onError.mock.calls[0]?.[0];

    expect(workflowError).toBeInstanceOf(PromptRunNoteRollbackError);
    expect((workflowError as PromptRunNoteRollbackError).cause).toMatchObject({
      message: 'Run deletion failed.',
    });
    expect(
      (workflowError as PromptRunNoteRollbackError).rollbackCause,
    ).toMatchObject({ message: 'Note rollback failed.' });
    expect(noteRepository.snapshot()).toEqual([]);
  });
});
