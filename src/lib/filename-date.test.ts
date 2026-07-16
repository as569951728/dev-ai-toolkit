import { describe, expect, it } from 'vitest';

import { formatLocalDateForFilename } from '@/lib/filename-date';

describe('formatLocalDateForFilename', () => {
  it('uses the local calendar date', () => {
    expect(
      formatLocalDateForFilename(new Date(2026, 6, 17, 0, 30)),
    ).toBe('2026-07-17');
  });

  it('uses an undated fallback for invalid dates', () => {
    expect(formatLocalDateForFilename('not-a-date')).toBe('undated');
  });
});
