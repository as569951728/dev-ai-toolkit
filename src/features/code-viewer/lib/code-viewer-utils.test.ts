import { describe, expect, it } from 'vitest';

import {
  buildCodeViewerUrl,
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

  it('builds Code Viewer URLs with encoded content and normalized language', () => {
    const url = new URL(
      buildCodeViewerUrl({
        left: 'system prompt with & symbol',
        right: 'user prompt\nwith newline',
        mode: 'compare',
        language: 'markdown',
      }),
      'https://example.test',
    );

    expect(url.pathname).toBe('/code-viewer');
    expect(url.searchParams.get('left')).toBe('system prompt with & symbol');
    expect(url.searchParams.get('right')).toBe('user prompt\nwith newline');
    expect(url.searchParams.get('mode')).toBe('compare');
    expect(url.searchParams.get('language')).toBe('markdown');
  });
});
