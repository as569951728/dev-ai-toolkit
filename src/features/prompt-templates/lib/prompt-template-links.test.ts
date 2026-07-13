import { describe, expect, it } from 'vitest';

import {
  buildPromptTemplateDetailPath,
  buildPromptTemplateEditPath,
} from '@/features/prompt-templates/lib/prompt-template-links';

describe('prompt-template-links', () => {
  it('encodes a template ID as one URL path segment', () => {
    expect(buildPromptTemplateDetailPath('imported/template #1')).toBe(
      '/prompts/imported%2Ftemplate%20%231',
    );
    expect(buildPromptTemplateDetailPath('template-1')).toBe(
      '/prompts/template-1',
    );
  });

  it('builds an edit path from the encoded template detail path', () => {
    expect(buildPromptTemplateEditPath('imported/template #1')).toBe(
      '/prompts/imported%2Ftemplate%20%231/edit',
    );
    expect(buildPromptTemplateEditPath('template-1')).toBe(
      '/prompts/template-1/edit',
    );
  });
});
