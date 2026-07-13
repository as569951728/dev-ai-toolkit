import { describe, expect, it } from 'vitest';

import { isPromptRunRecord } from '@/features/prompt-runs/lib/prompt-run-schema';
import type { PromptRunRecord } from '@/types/prompt-run';

const run: PromptRunRecord = {
  id: 'run-1',
  templateId: 'template-1',
  templateName: 'Code Review Assistant',
  templateVersion: 2,
  variables: { diff: 'src/App.tsx' },
  systemPrompt: 'You are a careful reviewer.',
  userPrompt: 'Review src/App.tsx.',
  createdAt: '2026-05-03T08:00:00.000Z',
};

describe('prompt-run-schema', () => {
  it('accepts a complete prompt run snapshot', () => {
    expect(isPromptRunRecord(run)).toBe(true);
  });

  it.each([
    ['blank id', { ...run, id: '   ' }],
    ['invalid template version', { ...run, templateVersion: 0 }],
    ['non-integer template version', { ...run, templateVersion: 1.5 }],
    ['non-string variable', { ...run, variables: { diff: 42 } }],
    ['invalid creation date', { ...run, createdAt: 'not-a-date' }],
  ])('rejects a snapshot with %s', (_label, candidate) => {
    expect(isPromptRunRecord(candidate)).toBe(false);
  });
});
