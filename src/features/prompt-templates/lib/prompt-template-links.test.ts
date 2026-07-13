import { describe, expect, it } from 'vitest';

import {
  buildPromptTemplateDetailPath,
  buildPromptTemplateEditPath,
  buildPromptTemplatePlaygroundPath,
  buildPromptTemplateRunHistoryPath,
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

  it('encodes template IDs used in query navigation', () => {
    expect(buildPromptTemplatePlaygroundPath('imported/template & #1')).toBe(
      '/playground?templateId=imported%2Ftemplate%20%26%20%231',
    );
    expect(buildPromptTemplateRunHistoryPath('imported/template & #1')).toBe(
      '/runs?templateId=imported%2Ftemplate%20%26%20%231',
    );
    expect(buildPromptTemplatePlaygroundPath('template-1')).toBe(
      '/playground?templateId=template-1',
    );
    expect(buildPromptTemplateRunHistoryPath('template-1')).toBe(
      '/runs?templateId=template-1',
    );
  });
});
