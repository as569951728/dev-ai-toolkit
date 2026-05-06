import { describe, expect, it } from 'vitest';

import {
  applyVariables,
  buildPromptPreview,
  extractVariables,
  formatPromptSections,
} from '@/features/prompt-playground/lib/prompt-playground-utils';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';

describe('prompt-playground-utils', () => {
  const template = mockPromptTemplates[0]!;

  it('extracts unique variables from both prompt sections', () => {
    const variables = extractVariables(template);

    expect(variables).toEqual([
      {
        key: 'repository_name',
        label: 'Repository Name',
      },
      {
        key: 'change_scope',
        label: 'Change Scope',
      },
    ]);
  });

  it('keeps placeholders when values are missing', () => {
    const result = applyVariables(
      'Review the {{repository_name}} changes in {{environment_name}}.',
      {
        repository_name: 'dev-ai-toolkit',
      },
    );

    expect(result).toBe(
      'Review the dev-ai-toolkit changes in {{environment_name}}.',
    );
  });

  it('builds prompt preview and formats the result for downstream tools', () => {
    const preview = buildPromptPreview(template, {
      repository_name: 'dev-ai-toolkit',
      change_scope: 'frontend',
    });

    expect(preview.systemPrompt).toContain('dev-ai-toolkit');
    expect(preview.userPrompt).toContain('frontend');
    expect(formatPromptSections(preview)).toContain('System prompt');
    expect(formatPromptSections(preview)).toContain('User prompt');
  });
});
