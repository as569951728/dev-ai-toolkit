import { describe, expect, it } from 'vitest';

import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import {
  createPromptRunRecord,
  deletePromptRunRecord,
  getRunsForTemplate,
  importPromptRunRecords,
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

function buildPromptRunRecord(
  id: string,
  createdAt: string,
): PromptRunRecord {
  return {
    id,
    templateId: 'template-1',
    templateName: 'Code Review Assistant',
    templateVersion: 1,
    variables: {},
    systemPrompt: 'System output',
    userPrompt: 'User output',
    createdAt,
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

  it('keeps the full saved run history when adding a new run', () => {
    const existingRuns = Array.from({ length: 21 }, (_, index) =>
      buildPromptRunRecord(
        `run-${index + 1}`,
        `2026-05-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`,
      ),
    );
    const repository = createMemoryRepository(existingRuns);

    const result = createPromptRunRecord(repository, repository.loadAll(), {
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      templateVersion: 2,
      variables: { repository_name: 'dev-ai-toolkit' },
      systemPrompt: 'New system output',
      userPrompt: 'New user output',
    });

    expect(result.runs).toHaveLength(existingRuns.length + 1);
    expect(repository.snapshot()).toHaveLength(existingRuns.length + 1);
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

  it('deletes a saved prompt run through the repository', () => {
    const repository = createMemoryRepository([
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
        templateId: 'template-2',
        templateName: 'Two',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'C',
        userPrompt: 'D',
        createdAt: '2026-05-06T11:00:00.000Z',
      },
    ]);

    const nextRuns = deletePromptRunRecord(
      repository,
      repository.loadAll(),
      'run-1',
    );

    expect(nextRuns).toHaveLength(1);
    expect(nextRuns[0]?.id).toBe('run-2');
    expect(repository.snapshot()).toEqual(nextRuns);
  });

  it('imports prompt runs by id without truncating restored history', () => {
    const repository = createMemoryRepository([
      {
        id: 'run-1',
        templateId: 'template-1',
        templateName: 'Current',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'A',
        userPrompt: 'B',
        createdAt: '2026-05-06T10:00:00.000Z',
      },
    ]);

    const nextRuns = importPromptRunRecords(repository, repository.loadAll(), [
      {
        id: 'run-1',
        templateId: 'template-1',
        templateName: 'Imported',
        templateVersion: 2,
        variables: { task: 'restore' },
        systemPrompt: 'Imported A',
        userPrompt: 'Imported B',
        createdAt: '2026-05-06T11:00:00.000Z',
      },
      {
        id: 'run-2',
        templateId: 'template-2',
        templateName: 'New',
        templateVersion: 1,
        variables: {},
        systemPrompt: 'C',
        userPrompt: 'D',
        createdAt: '2026-05-06T12:00:00.000Z',
      },
    ]);

    expect(nextRuns.map((run) => run.id)).toEqual(['run-2', 'run-1']);
    expect(nextRuns.find((run) => run.id === 'run-1')?.templateName).toBe(
      'Imported',
    );
    expect(repository.snapshot()).toEqual(nextRuns);
  });
});
