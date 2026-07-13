import { describe, expect, it } from 'vitest';

import {
  formatCapturedVariableCount,
  formatPromptRunCreatedAt,
  getCapturedVariablePreview,
} from '@/features/prompt-runs/lib/prompt-run-display';

describe('prompt-run-display', () => {
  it('formats saved run timestamps for display', () => {
    expect(formatPromptRunCreatedAt('2026-01-15T12:30:00')).toBe(
      'Jan 15, 2026, 12:30 PM',
    );
  });

  it('formats captured variable counts with readable singular and plural text', () => {
    expect(formatCapturedVariableCount(0)).toBe(
      'No template variables were captured in this run.',
    );
    expect(formatCapturedVariableCount(1)).toBe(
      '1 template variable was captured in this run.',
    );
    expect(formatCapturedVariableCount(2)).toBe(
      '2 template variables were captured in this run.',
    );
  });

  it('builds a compact captured variable preview', () => {
    expect(
      getCapturedVariablePreview(
        {
          feature_name: 'run-history-page',
          endpoint: '/v1/prompts',
          repository_name: 'dev-ai-toolkit',
          change_scope: 'frontend',
        },
        3,
      ),
    ).toEqual({
      entries: [
        ['feature_name', 'run-history-page'],
        ['endpoint', '/v1/prompts'],
        ['repository_name', 'dev-ai-toolkit'],
      ],
      remainingCount: 1,
    });
  });
});
