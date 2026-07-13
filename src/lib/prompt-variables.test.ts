import { describe, expect, it } from 'vitest';

import {
  extractPromptVariableKeys,
  replacePromptVariablePlaceholders,
} from '@/lib/prompt-variables';

describe('prompt variable helpers', () => {
  it('extracts unique variable keys in first-seen order', () => {
    expect(
      extractPromptVariableKeys(
        'Review {{ repository_name }} and {{pull-request.title}}.',
        'Reuse {{repository_name}} for {{release.version-1}}.',
      ),
    ).toEqual([
      'repository_name',
      'pull-request.title',
      'release.version-1',
    ]);
  });

  it('replaces supported placeholders through the provided callback', () => {
    const replacements: Record<string, string> = {
      repository_name: 'dev-ai-toolkit',
      'pull-request.title': 'Share prompt parsing',
    };

    expect(
      replacePromptVariablePlaceholders(
        'Update {{repository_name}} for {{ pull-request.title }}.',
        (key) => replacements[key] ?? `{{${key}}}`,
      ),
    ).toBe('Update dev-ai-toolkit for Share prompt parsing.');
  });
});
