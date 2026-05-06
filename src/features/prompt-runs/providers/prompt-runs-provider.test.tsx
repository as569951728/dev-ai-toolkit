import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
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
  const { runs, createRun, getRunsByTemplateId } = usePromptRuns();

  return (
    <div>
      <span data-testid="run-count">{runs.length}</span>
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
    </div>
  );
}

describe('PromptRunsProvider', () => {
  it('persists prompt runs through the injected repository', () => {
    const repository = createMemoryRepository();

    render(
      <PromptRunsProvider repository={repository}>
        <TestConsumer />
      </PromptRunsProvider>,
    );

    expect(screen.getByTestId('run-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Save Run' }));

    expect(screen.getByTestId('run-count')).toHaveTextContent('1');
    expect(screen.getByTestId('template-1-count')).toHaveTextContent('1');
    expect(repository.snapshot()[0]?.templateName).toBe('Code Review Assistant');
  });
});
