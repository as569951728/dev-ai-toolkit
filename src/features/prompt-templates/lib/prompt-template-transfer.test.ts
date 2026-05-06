import { describe, expect, it } from 'vitest';

import {
  mergePromptTemplates,
  parsePromptTemplateImport,
  stringifyPromptTemplateExport,
} from '@/features/prompt-templates/lib/prompt-template-transfer';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';

describe('prompt-template-transfer', () => {
  const existingReviewTemplate = mockPromptTemplates[0]!;
  const existingApiTemplate = mockPromptTemplates[1]!;

  it('parses exported payloads and reports created or updated counts', () => {
    const incoming = [
      {
        ...existingReviewTemplate,
        description: 'Updated description',
      },
      {
        id: 'new-template',
        name: 'New Template',
        description: 'Brand new template',
        systemPrompt: 'You are helping with {{repo}}.',
        userPrompt: 'Summarize {{task}}.',
        tags: ['new'],
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
    ];

    const rawValue = JSON.stringify({
      version: 1,
      exportedAt: '2026-05-01T00:00:00.000Z',
      templates: incoming,
    });

    const result = parsePromptTemplateImport(rawValue, mockPromptTemplates);

    expect(result.summary).toEqual({
      created: 1,
      updated: 1,
      total: 2,
    });
    expect(result.importedTemplates[0]?.description).toBe('Updated description');
    expect(result.importedTemplates[1]?.id).toBe('new-template');
  });

  it('exports and merges templates without dropping existing ids', () => {
    const exported = stringifyPromptTemplateExport(mockPromptTemplates);
    const parsed = JSON.parse(exported) as { templates: unknown[] };

    expect(parsed.templates).toHaveLength(mockPromptTemplates.length);

    const merged = mergePromptTemplates(mockPromptTemplates, [
      {
        ...existingApiTemplate,
        name: 'Updated API Design Partner',
      },
    ]);

    expect(merged).toHaveLength(mockPromptTemplates.length);
    expect(merged.find((item) => item.id === existingApiTemplate.id)?.name).toBe(
      'Updated API Design Partner',
    );
  });
});
