import { describe, expect, it } from 'vitest';

import { formatPromptSections } from '@/lib/prompt-sections';

describe('prompt section formatting', () => {
  it('keeps system and user prompts labeled in a portable text block', () => {
    expect(
      formatPromptSections({
        systemPrompt: 'You are a careful reviewer.',
        userPrompt: 'Review this change.',
      }),
    ).toBe(
      'System prompt\nYou are a careful reviewer.\n\nUser prompt\nReview this change.',
    );
  });
});
