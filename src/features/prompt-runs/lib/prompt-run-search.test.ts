import { describe, expect, it } from 'vitest';

import { matchesPromptRunSearch } from '@/features/prompt-runs/lib/prompt-run-search';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';

const sampleRun: PromptRunRecord = {
  id: 'run-1',
  templateId: 'template-1',
  templateName: 'API Design Partner',
  templateVersion: 2,
  variables: {
    endpoint: '/v1/users',
    repository_name: 'dev-ai-toolkit',
  },
  systemPrompt: 'You are reviewing an API contract.',
  userPrompt: 'Focus on pagination and error payloads.',
  createdAt: '2026-05-07T09:00:00.000Z',
};

const sampleNote: PromptRunNote = {
  id: 'note-1',
  runId: 'run-1',
  body: 'Useful baseline for endpoint review.',
  createdAt: '2026-05-08T09:00:00.000Z',
  updatedAt: '2026-05-08T09:00:00.000Z',
};

describe('matchesPromptRunSearch', () => {
  it.each([
    ['stored template name', 'api design'],
    ['current source template name', 'current api reviewer'],
    ['saved system prompt text', 'api contract'],
    ['saved user prompt text', 'error payloads'],
    ['captured variable name', 'repository_name'],
    ['captured variable value', '/v1/users'],
    ['saved note content', 'endpoint review'],
  ])('matches by %s', (_label, query) => {
    expect(
      matchesPromptRunSearch({
        run: sampleRun,
        sourceTemplateName: 'Current API Reviewer',
        note: sampleNote,
        query,
      }),
    ).toBe(true);
  });

  it('matches empty search values', () => {
    expect(
      matchesPromptRunSearch({
        run: sampleRun,
        sourceTemplateName: '',
        note: null,
        query: '   ',
      }),
    ).toBe(true);
  });

  it('returns false when no saved run context matches the query', () => {
    expect(
      matchesPromptRunSearch({
        run: sampleRun,
        sourceTemplateName: 'Current API Reviewer',
        note: sampleNote,
        query: 'release checklist',
      }),
    ).toBe(false);
  });
});
