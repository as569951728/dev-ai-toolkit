import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import {
  createLocalStoragePromptRunRepository,
  PROMPT_RUN_STORAGE_KEY,
} from '@/features/prompt-runs/repositories/local-storage-prompt-run-repository';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

function createMemoryRepository(
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

function TestConsumer() {
  const {
    runs,
    createRun,
    getRunById,
    getRunsByTemplateId,
    importRuns,
    replaceRuns,
  } = usePromptRuns();

  return (
    <div>
      <span data-testid="run-count">{runs.length}</span>
      <span data-testid="known-run">
        {getRunById('existing-run')?.templateName ?? 'missing'}
      </span>
      <span data-testid="template-1-count">{getRunsByTemplateId('template-1').length}</span>
      <button
        type="button"
        onClick={() => {
          createRun({
            templateId: 'template-1',
            templateName: 'Code Review Assistant',
            templateVersion: 2,
            variables: { repository_name: 'dev-ai-toolkit' },
            systemPrompt: 'System',
            userPrompt: 'User',
          });
        }}
      >
        Save Run
      </button>
      <button
        type="button"
        onClick={() => {
          for (const templateName of ['First Run', 'Second Run']) {
            createRun({
              templateId: 'template-1',
              templateName,
              templateVersion: 1,
              variables: {},
              systemPrompt: 'System',
              userPrompt: 'User',
            });
          }
        }}
      >
        Save Two Runs
      </button>
      <button
        type="button"
        onClick={() => {
          importRuns([
            {
              id: 'imported-run',
              templateId: 'template-1',
              templateName: 'Imported Run',
              templateVersion: 1,
              variables: {},
              systemPrompt: 'Imported system',
              userPrompt: 'Imported user',
              createdAt: '2026-05-08T08:00:00.000Z',
            },
          ]);
        }}
      >
        Import runs
      </button>
      <button
        type="button"
        onClick={() =>
          replaceRuns([
            {
              id: 'replacement-run',
              templateId: 'template-3',
              templateName: 'Replacement Run',
              templateVersion: 1,
              variables: {},
              systemPrompt: 'Replacement system',
              userPrompt: 'Replacement user',
              createdAt: '2026-05-09T08:00:00.000Z',
            },
          ])
        }
      >
        Replace runs
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('PromptRunsProvider', () => {
  it('persists prompt runs through the injected repository', () => {
    const repository = createMemoryRepository([
      {
        id: 'existing-run',
        templateId: 'template-2',
        templateName: 'API Design Partner',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'System',
        userPrompt: 'User',
        createdAt: '2026-05-07T08:00:00.000Z',
      },
    ]);

    render(
      <PromptRunsProvider repository={repository}>
        <TestConsumer />
      </PromptRunsProvider>,
    );

    expect(screen.getByTestId('run-count')).toHaveTextContent('1');
    expect(screen.getByTestId('known-run')).toHaveTextContent(
      'API Design Partner',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Run' }));

    expect(screen.getByTestId('run-count')).toHaveTextContent('2');
    expect(screen.getByTestId('template-1-count')).toHaveTextContent('1');
    expect(repository.snapshot()[0]?.templateName).toBe('Code Review Assistant');
  });

  it('imports prompt runs through the injected repository', () => {
    const repository = createMemoryRepository();

    render(
      <PromptRunsProvider repository={repository}>
        <TestConsumer />
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Import runs' }));

    expect(screen.getByTestId('run-count')).toHaveTextContent('1');
    expect(repository.snapshot()[0]).toMatchObject({
      id: 'imported-run',
      templateName: 'Imported Run',
    });
  });

  it('preserves prompt runs created before the provider renders again', () => {
    const repository = createMemoryRepository();

    render(
      <PromptRunsProvider repository={repository}>
        <TestConsumer />
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Two Runs' }));

    expect(screen.getByTestId('run-count')).toHaveTextContent('2');
    expect(repository.snapshot()).toHaveLength(2);
    expect(repository.snapshot().map((run) => run.templateName)).toEqual([
      'Second Run',
      'First Run',
    ]);
  });

  it('replaces the full prompt run collection', () => {
    const repository = createMemoryRepository([
      {
        id: 'existing-run',
        templateId: 'template-1',
        templateName: 'Existing Run',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'System',
        userPrompt: 'User',
        createdAt: '2026-05-08T08:00:00.000Z',
      },
    ]);

    render(
      <PromptRunsProvider repository={repository}>
        <TestConsumer />
      </PromptRunsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Replace runs' }));

    expect(screen.getByTestId('run-count')).toHaveTextContent('1');
    expect(repository.snapshot().map((run) => run.id)).toEqual([
      'replacement-run',
    ]);
  });

  it('reloads prompt runs saved by another tab', () => {
    render(
      <PromptRunsProvider>
        <TestConsumer />
      </PromptRunsProvider>,
    );

    createLocalStoragePromptRunRepository().saveAll([
      {
        id: 'existing-run',
        templateId: 'template-2',
        templateName: 'External Review Run',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'External system prompt',
        userPrompt: 'External user prompt',
        createdAt: '2026-05-10T08:00:00.000Z',
      },
    ]);
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: PROMPT_RUN_STORAGE_KEY }),
      );
    });

    expect(screen.getByTestId('run-count')).toHaveTextContent('1');
    expect(screen.getByTestId('known-run')).toHaveTextContent(
      'External Review Run',
    );
  });
});
