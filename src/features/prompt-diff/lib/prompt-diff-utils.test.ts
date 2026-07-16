import { describe, expect, it } from 'vitest';

import {
  countPromptCharacters,
  countPromptLines,
  extractPromptVariables,
  getAddedValues,
  getLineChanges,
  getRemovedValues,
  splitPromptLines,
} from '@/features/prompt-diff/lib/prompt-diff-utils';

describe('prompt-diff-utils', () => {
  it('counts prompt characters and lines', () => {
    expect(countPromptCharacters('hello')).toBe(5);
    expect(countPromptLines('')).toBe(0);
    expect(countPromptLines('system\nuser\nconstraints')).toBe(3);
  });

  it('splits prompt content into lines', () => {
    expect(splitPromptLines('')).toEqual([]);
    expect(splitPromptLines('system\nuser')).toEqual(['system', 'user']);
  });

  it('extracts unique prompt variables from common placeholder shapes', () => {
    const value = [
      'Review {{ repository_name }}.',
      'Focus on {{module-name}} and {{module.name}}.',
      'Repeat {{repository_name}} once for context.',
    ].join('\n');

    expect(extractPromptVariables(value)).toEqual([
      'repository_name',
      'module-name',
      'module.name',
    ]);
  });

  it('returns added and removed values while preserving source order', () => {
    expect(getAddedValues(['a', 'b'], ['b', 'c', 'd'])).toEqual(['c', 'd']);
    expect(getRemovedValues(['a', 'b', 'c'], ['b'])).toEqual(['a', 'c']);
  });

  it('counts repeated line occurrences while preserving source order', () => {
    expect(getLineChanges(['a', 'b'], ['a', 'b', 'a', 'c'])).toEqual({
      added: ['a', 'c'],
      removed: [],
    });
    expect(getLineChanges(['a', 'b', 'a', 'c'], ['a', 'b'])).toEqual({
      added: [],
      removed: ['a', 'c'],
    });
  });

  it('represents reordered lines as removals and additions', () => {
    expect(getLineChanges(['a', 'b'], ['b', 'a'])).toEqual({
      added: ['a'],
      removed: ['a'],
    });
  });

  it('handles empty and unchanged line collections', () => {
    expect(getLineChanges([], ['a'])).toEqual({
      added: ['a'],
      removed: [],
    });
    expect(getLineChanges(['a'], [])).toEqual({
      added: [],
      removed: ['a'],
    });
    expect(getLineChanges(['a'], ['a'])).toEqual({
      added: [],
      removed: [],
    });
  });
});
