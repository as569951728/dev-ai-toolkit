import { describe, expect, it } from 'vitest';

import {
  applyVariables,
  buildPromptPreview,
  countUnresolvedVariables,
  extractVariables,
} from '@/features/prompt-playground/lib/prompt-playground-utils';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';

describe('prompt-playground-utils', () => {
  const template = starterPromptTemplates[0]!;

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

  it('preserves meaningful whitespace in multiline variable values', () => {
    const codeSnippet = '  const result = runPrompt();\n';

    expect(
      applyVariables('Inspect this code:\n{{code_snippet}}End of snippet.', {
        code_snippet: codeSnippet,
      }),
    ).toBe(`Inspect this code:\n${codeSnippet}End of snippet.`);
    expect(
      applyVariables('Inspect {{code_snippet}}.', { code_snippet: '   ' }),
    ).toBe('Inspect {{code_snippet}}.');
  });

  it('detects and replaces dotted variable names', () => {
    const dottedTemplate = {
      ...template,
      systemPrompt: 'Review pull request {{pull_request.title}}.',
      userPrompt: 'Focus on {{pull_request.change-scope}}.',
    };

    expect(extractVariables(dottedTemplate)).toEqual([
      {
        key: 'pull_request.title',
        label: 'Pull Request Title',
      },
      {
        key: 'pull_request.change-scope',
        label: 'Pull Request Change Scope',
      },
    ]);
    expect(
      applyVariables(dottedTemplate.systemPrompt, {
        'pull_request.title': 'Preserve prompt context',
      }),
    ).toBe('Review pull request Preserve prompt context.');
  });

  it('counts empty and whitespace-only variables as unresolved', () => {
    const variables = extractVariables(template);

    expect(
      countUnresolvedVariables(variables, {
        repository_name: 'dev-ai-toolkit',
        change_scope: '   ',
      }),
    ).toBe(1);
    expect(
      countUnresolvedVariables(variables, {
        repository_name: 'dev-ai-toolkit',
        change_scope: 'frontend workflow',
      }),
    ).toBe(0);
  });

  it('builds a prompt preview from template variables', () => {
    const preview = buildPromptPreview(template, {
      repository_name: 'dev-ai-toolkit',
      change_scope: 'frontend',
    });

    expect(preview.systemPrompt).toContain('dev-ai-toolkit');
    expect(preview.userPrompt).toContain('frontend');
  });
});
