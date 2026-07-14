import { describe, expect, it } from 'vitest';

import { normalizePromptTemplateListSearchParams } from '@/features/prompt-templates/lib/prompt-template-list-query';

describe('prompt-template-list-query', () => {
  it('removes filters that do not affect the visible template list', () => {
    const searchParams = new URLSearchParams(
      'tag=missing&archived=2&search=+++&source=docs',
    );

    const normalized = normalizePromptTemplateListSearchParams(searchParams, {
      hasRequestedTag: false,
    });

    expect(normalized?.toString()).toBe('source=docs');
  });

  it('leaves supported list filters unchanged', () => {
    const searchParams = new URLSearchParams(
      'tag=review&archived=1&search=code+review',
    );

    expect(
      normalizePromptTemplateListSearchParams(searchParams, {
        hasRequestedTag: true,
      }),
    ).toBeNull();
  });
});
