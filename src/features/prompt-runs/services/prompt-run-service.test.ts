import { describe, expect, it } from 'vitest';

import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import {
  createPromptRunRecord,
  getRunsForTemplate,
  sortPromptRuns,
} from '@/features/prompt-runs/services/prompt-run-service';
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

describe('prompt-run-service', () => {
  it('creates and sorts prompt runs while keeping recent entries first', () => {
    const repository = createMemoryRepository();

    const firstRun = createPromptRunRecord(repository, repository.loadAll(), {
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      templateVersion: 2,
      variables: { repository_name: 'dev-ai-toolkit' },
      systemPrompt: 'System output',
      userPrompt: 'User output',
    });

    const secondRun = createPromptRunRecord(repository, repository.loadAll(), {
      templateId: 'template-2',
      templateName: 'API Design Partner',
      templateVersion: 1,
      variables: {},
      systemPrompt: 'System output 2',
      userPrompt: 'User output 2',
    });

    const sorted = sortPromptRuns(repository.snapshot());

    expect(firstRun.record.id).toBeTruthy();
    expect(secondRun.record.id).toBeTruthy();
    expect(sorted[0]?.templateId).toBe('template-2');
    expect(sorted[1]?.templateId).toBe('template-1');
  });

  it('filters runs by template id and respects limits', () => {
    const runs: PromptRunRecord[] = [
      {
        id: 'run-1',
        templateId: 'template-1',
        templateName: 'One',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'A',
        userPrompt: 'B',
        createdAt: '2026-05-06T10:00:00.000Z',
      },
      {
        id: 'run-2',
        templateId: 'template-1',
        templateName: 'One',
        templateVersion: 2,
        variables: {},
        systemPrompt: 'A2',
        userPrompt: 'B2',
        createdAt: '2026-05-06T11:00:00.000Z',
      },
      {
        id: 'run-3',
        templateId: 'template-2',
        templateName: 'Two',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'C',
        userPrompt: 'D',
        createdAt: '2026-05-06T12:00:00.000Z',
      },
    ];

    expect(getRunsForTemplate(runs, 'template-1')).toHaveLength(2);
    expect(getRunsForTemplate(runs, 'template-1', 1)[0]?.id).toBe('run-1');
  });
});
