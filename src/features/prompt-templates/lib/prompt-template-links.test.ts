import { describe, expect, it } from 'vitest';

import {
  buildPromptTemplateCreatePath,
  buildPromptTemplateDetailPath,
  buildPromptTemplateEditPath,
  buildPromptTemplatePlaygroundPath,
  buildPromptTemplateRunHistoryPath,
  createPromptTemplateNavigationState,
  getPromptTemplateListReturnPath,
} from '@/features/prompt-templates/lib/prompt-template-links';

describe('prompt-template-links', () => {
  it('builds the standalone template create path', () => {
    expect(buildPromptTemplateCreatePath()).toBe('/create-template');
    expect(buildPromptTemplateCreatePath('imported/run #1')).toBe(
      '/create-template?runId=imported%2Frun%20%231',
    );
  });

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

  it('keeps only Prompt Template list paths as return targets', () => {
    const listPath = '/prompts?search=review&tag=code&archived=1';

    expect(
      getPromptTemplateListReturnPath(
        createPromptTemplateNavigationState(listPath),
      ),
    ).toBe(listPath);
    expect(
      getPromptTemplateListReturnPath({ listPath: '/runs?search=review' }),
    ).toBe('/prompts');
    expect(getPromptTemplateListReturnPath(undefined)).toBe('/prompts');
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
