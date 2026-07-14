import { describe, expect, it } from 'vitest';

import {
  isPromptTemplate,
  isPromptTemplateRevision,
} from '@/features/prompt-templates/lib/prompt-template-schema';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';

const template = starterPromptTemplates[0]!;

describe('prompt-template-schema', () => {
  it('accepts a complete prompt template and revision', () => {
    expect(isPromptTemplate(template)).toBe(true);
    expect(isPromptTemplateRevision(template.revisions[0])).toBe(true);
  });

  it('rejects a template without its current revision', () => {
    expect(
      isPromptTemplate({
        ...template,
        revisions: template.revisions.filter(
          (revision) => revision.version !== template.version,
        ),
      }),
    ).toBe(false);
  });

  it('rejects duplicate or malformed revisions', () => {
    expect(
      isPromptTemplate({
        ...template,
        revisions: [...template.revisions, template.revisions[0]],
      }),
    ).toBe(false);
    expect(
      isPromptTemplateRevision({
        ...template.revisions[0],
        version: 1.5,
      }),
    ).toBe(false);
  });

  it('rejects revisions newer than the current template version', () => {
    expect(
      isPromptTemplate({
        ...template,
        revisions: [
          ...template.revisions,
          {
            ...template.revisions[0]!,
            version: template.version + 1,
          },
        ],
      }),
    ).toBe(false);
  });

  it('rejects current revisions that disagree with template content', () => {
    expect(
      isPromptTemplate({
        ...template,
        userPrompt: `${template.userPrompt}\nAdd a concise risk summary.`,
      }),
    ).toBe(false);
  });
});
