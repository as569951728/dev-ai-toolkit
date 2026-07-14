import { describe, expect, it } from 'vitest';

import { isValidDateString } from '@/lib/date-validation';

describe('date-validation', () => {
  it('accepts persisted date strings that JavaScript can parse', () => {
    expect(isValidDateString('2026-07-13T08:00:00.000Z')).toBe(true);
    expect(isValidDateString('Thu, 07 May 2026 09:00:00 GMT')).toBe(true);
  });

  it('rejects blank, invalid, and non-string values', () => {
    expect(isValidDateString('')).toBe(false);
    expect(isValidDateString('   ')).toBe(false);
    expect(isValidDateString('not-a-date')).toBe(false);
    expect(isValidDateString(1)).toBe(false);
    expect(isValidDateString(null)).toBe(false);
  });
});
