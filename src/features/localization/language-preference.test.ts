import { describe, expect, it } from 'vitest';

import { detectPreferredLanguage } from '@/features/localization/language-preference';

describe('detectPreferredLanguage', () => {
  it('selects Simplified Chinese when a Chinese browser language is present', () => {
    expect(detectPreferredLanguage(['zh-CN', 'en-US'])).toBe('zh-CN');
    expect(detectPreferredLanguage(['zh-Hans'])).toBe('zh-CN');
  });

  it('keeps English for other browser languages', () => {
    expect(detectPreferredLanguage(['en-US'])).toBe('en');
    expect(detectPreferredLanguage(['ja-JP', 'en-US'])).toBe('en');
  });
});
