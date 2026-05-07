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

  it('normalizes malformed revision payloads and falls back to a safe current revision', () => {
    const rawValue = JSON.stringify([
      {
        id: 'legacy-template',
        name: 'Legacy Template',
        description: 'Imported from an older file',
        systemPrompt: 'Inspect {{repo}}.',
        userPrompt: 'Summarize {{task}}.',
        updatedAt: 'not-a-date',
        version: 3,
        revisions: [
          null,
          {
            version: 2,
            updatedAt: '2026-05-01T00:00:00.000Z',
            name: 'Legacy Template',
            description: 'Older revision',
            systemPrompt: 'Inspect {{repo}}.',
            userPrompt: 'Summarize {{task}}.',
            tags: ['legacy', '', 'legacy'],
          },
          {
            version: 0,
            updatedAt: 'bad-date',
            name: '',
            description: '',
            systemPrompt: '',
            userPrompt: '',
            tags: [],
          },
        ],
      },
    ]);

    const result = parsePromptTemplateImport(rawValue, mockPromptTemplates);
    const importedTemplate = result.importedTemplates[0]!;

    expect(result.summary).toEqual({
      created: 1,
      updated: 0,
      total: 1,
    });
    expect(importedTemplate.version).toBe(3);
    expect(importedTemplate.revisions).toHaveLength(2);
    expect(importedTemplate.revisions[0]).toMatchObject({
      version: 2,
      tags: ['legacy'],
    });
    expect(importedTemplate.revisions[1]?.version).toBe(3);
  });

  it('deduplicates repeated template ids inside the same import file', () => {
    const rawValue = JSON.stringify([
      {
        id: 'duplicate-template',
        name: 'Duplicate Template',
        description: 'First revision',
        systemPrompt: 'Draft {{task}}.',
        userPrompt: 'Explain {{task}}.',
        tags: ['draft'],
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
      {
        id: 'duplicate-template',
        name: 'Duplicate Template',
        description: 'Second revision wins',
        systemPrompt: 'Draft {{task}} carefully.',
        userPrompt: 'Explain {{task}} carefully.',
        tags: ['draft', 'final'],
        updatedAt: '2026-05-02T00:00:00.000Z',
      },
    ]);

    const result = parsePromptTemplateImport(rawValue, mockPromptTemplates);

    expect(result.summary).toEqual({
      created: 1,
      updated: 0,
      total: 1,
    });
    expect(result.importedTemplates).toHaveLength(1);
    expect(result.importedTemplates[0]?.description).toBe('Second revision wins');
  });

  it('normalizes archived template state from imported payloads', () => {
    const archivedTemplate = {
      ...existingApiTemplate,
      archivedAt: '2026-05-03T08:00:00.000Z',
    };

    const rawValue = JSON.stringify([
      {
        id: archivedTemplate.id,
        name: archivedTemplate.name,
        description: 'Imported update keeps the archived state stable',
        systemPrompt: archivedTemplate.systemPrompt,
        userPrompt: archivedTemplate.userPrompt,
        tags: archivedTemplate.tags,
        updatedAt: '2026-05-05T00:00:00.000Z',
        archivedAt: 'not-a-date',
      },
      {
        id: 'fresh-archived-template',
        name: 'Fresh Archived Template',
        description: 'Imported as archived from another browser session',
        systemPrompt: 'Review {{repo}}.',
        userPrompt: 'List the most important changes.',
        tags: ['archived'],
        updatedAt: '2026-05-05T00:00:00.000Z',
        archivedAt: '2026-05-04T12:00:00.000Z',
      },
      {
        id: 'fresh-active-template',
        name: 'Fresh Active Template',
        description: 'Malformed archivedAt should not archive a new template',
        systemPrompt: 'Audit {{repo}}.',
        userPrompt: 'Summarize {{task}}.',
        tags: ['active'],
        updatedAt: '2026-05-05T00:00:00.000Z',
        archivedAt: 'definitely-not-a-date',
      },
    ]);

    const result = parsePromptTemplateImport(rawValue, [
      existingReviewTemplate,
      archivedTemplate,
    ]);

    expect(
      result.importedTemplates.find((template) => template.id === archivedTemplate.id)
        ?.archivedAt,
    ).toBe(archivedTemplate.archivedAt);
    expect(
      result.importedTemplates.find(
        (template) => template.id === 'fresh-archived-template',
      )?.archivedAt,
    ).toBe('2026-05-04T12:00:00.000Z');
    expect(
      result.importedTemplates.find(
        (template) => template.id === 'fresh-active-template',
      )?.archivedAt,
    ).toBeNull();
  });
});
