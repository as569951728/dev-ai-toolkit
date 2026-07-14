import { describe, expect, it } from 'vitest';

import {
  createPromptDiffNavigationState,
  readPromptDiffNavigationState,
} from '@/features/prompt-diff/lib/prompt-diff-navigation';

describe('prompt-diff-navigation', () => {
  it('round trips prompt comparisons through router state', () => {
    const state = createPromptDiffNavigationState({
      left: 'Original prompt',
      right: 'Revised prompt',
    });

    expect(readPromptDiffNavigationState(state)).toEqual({
      left: 'Original prompt',
      right: 'Revised prompt',
    });
  });

  it('ignores unrelated or malformed router state', () => {
    expect(readPromptDiffNavigationState(null)).toBeNull();
    expect(readPromptDiffNavigationState({ promptDiff: 'invalid' })).toBeNull();
    expect(
      readPromptDiffNavigationState({
        promptDiff: { left: 'Original prompt', right: 42 },
      }),
    ).toBeNull();
  });
});
