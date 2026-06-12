import { describe, expect, it } from 'vitest';

import {
  countCharacters,
  countLines,
  normalizeCodeViewerLanguage,
} from '@/features/code-viewer/lib/code-viewer-utils';

describe('code-viewer-utils', () => {
  it('counts characters in code viewer content', () => {
    expect(countCharacters('')).toBe(0);
    expect(countCharacters('const value = 1;')).toBe(16);
  });

  it('counts lines in code viewer content', () => {
    expect(countLines('')).toBe(0);
    expect(countLines('const value = 1;')).toBe(1);
    expect(countLines('const value = 1;\nexport default value;')).toBe(2);
  });

  it('normalizes unsupported language values to a safe fallback', () => {
    expect(normalizeCodeViewerLanguage('markdown')).toBe('markdown');
    expect(normalizeCodeViewerLanguage('text')).toBe('plaintext');
    expect(normalizeCodeViewerLanguage(null, 'typescript')).toBe('typescript');
  });
});
