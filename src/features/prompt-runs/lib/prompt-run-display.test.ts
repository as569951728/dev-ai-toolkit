import { describe, expect, it } from 'vitest';

import { formatCapturedVariableCount } from '@/features/prompt-runs/lib/prompt-run-display';

describe('prompt-run-display', () => {
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
});
