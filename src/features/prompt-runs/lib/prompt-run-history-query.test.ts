import { describe, expect, it } from 'vitest';

import {
  buildPromptRunHistorySearchParams,
  getPromptRunSortOrder,
  normalizePromptRunHistorySearchParams,
} from '@/features/prompt-runs/lib/prompt-run-history-query';

describe('prompt run history query state', () => {
  it('builds a compact query while preserving meaningful filter values', () => {
    const searchParams = buildPromptRunHistorySearchParams({
      searchValue: 'review this',
      sortOrder: 'oldest',
      templateId: 'template-1',
    });

    expect(searchParams.toString()).toBe(
      'templateId=template-1&q=review+this&order=oldest',
    );
    expect(
      buildPromptRunHistorySearchParams({
        searchValue: '   ',
        sortOrder: 'newest',
        templateId: 'all',
      }).toString(),
    ).toBe('');
  });

  it('reads oldest as the only non-default sort order', () => {
    expect(getPromptRunSortOrder(new URLSearchParams('order=oldest'))).toBe(
      'oldest',
    );
    expect(getPromptRunSortOrder(new URLSearchParams('order=random'))).toBe(
      'newest',
    );
  });

  it('removes unsupported sort and template values in one update', () => {
    const normalized = normalizePromptRunHistorySearchParams(
      new URLSearchParams(
        'templateId=missing-template&q=review&order=random',
      ),
      { hasRequestedTemplate: false },
    );

    expect(normalized?.toString()).toBe('q=review');
  });

  it('removes explicit defaults and empty searches', () => {
    const normalized = normalizePromptRunHistorySearchParams(
      new URLSearchParams('templateId=all&q=+++&source=docs'),
      { hasRequestedTemplate: true },
    );

    expect(normalized?.toString()).toBe('source=docs');
  });

  it('keeps valid and orphaned-template filters unchanged', () => {
    expect(
      normalizePromptRunHistorySearchParams(
        new URLSearchParams('templateId=deleted-template&order=oldest'),
        { hasRequestedTemplate: true },
      ),
    ).toBeNull();
  });
});
