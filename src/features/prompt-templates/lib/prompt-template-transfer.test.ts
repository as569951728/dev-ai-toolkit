import { describe, expect, it } from 'vitest';

import {
  mergePromptTemplates,
  parsePromptTemplateImport,
  stringifyPromptTemplateExport,
} from '@/features/prompt-templates/lib/prompt-template-transfer';
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';

describe('prompt-template-transfer', () => {
  const existingReviewTemplate = starterPromptTemplates[0]!;
  const existingApiTemplate = starterPromptTemplates[1]!;

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

    const result = parsePromptTemplateImport(rawValue, starterPromptTemplates);

    expect(result.summary).toEqual({
      created: 1,
      updated: 1,
      total: 2,
    });
    expect(result.importedTemplates[0]?.description).toBe('Updated description');
    expect(result.importedTemplates[1]?.id).toBe('new-template');
  });

  it('exports and merges templates without dropping existing ids', () => {
    const exported = stringifyPromptTemplateExport(starterPromptTemplates);
    const parsed = JSON.parse(exported) as { templates: unknown[] };

    expect(parsed.templates).toHaveLength(starterPromptTemplates.length);

    const merged = mergePromptTemplates(starterPromptTemplates, [
      {
        ...existingApiTemplate,
        name: 'Updated API Design Partner',
      },
    ]);

    expect(merged).toHaveLength(starterPromptTemplates.length);
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
            version: 2,
            updatedAt: '2026-05-02T00:00:00.000Z',
            name: 'Legacy Template',
            description: 'Latest duplicate revision wins',
            systemPrompt: 'Inspect {{repo}} more carefully.',
            userPrompt: 'Summarize {{task}} with risks.',
            tags: ['legacy', 'latest'],
          },
          {
            version: 3,
            updatedAt: '2026-05-01T00:00:00.000Z',
            name: 'Legacy Template',
            description: 'Stale current revision from the import file',
            systemPrompt: 'Outdated system prompt.',
            userPrompt: 'Outdated user prompt.',
            tags: ['stale'],
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

    const result = parsePromptTemplateImport(rawValue, starterPromptTemplates);
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
      description: 'Latest duplicate revision wins',
      tags: ['legacy', 'latest'],
    });
    expect(importedTemplate.revisions[1]).toMatchObject({
      version: 3,
      description: 'Imported from an older file',
      systemPrompt: 'Inspect {{repo}}.',
      userPrompt: 'Summarize {{task}}.',
    });
  });

  it('reports invalid template import JSON with a stable message', () => {
    expect(() =>
      parsePromptTemplateImport('{not-json', starterPromptTemplates),
    ).toThrow(
      'Invalid file format. Expected a template array or an exported dev-ai-toolkit payload.',
    );
  });

  it('rejects unsupported exported template payload versions', () => {
    expect(() =>
      parsePromptTemplateImport(
        JSON.stringify({
          version: 99,
          exportedAt: '2026-05-01T00:00:00.000Z',
          templates: [existingReviewTemplate],
        }),
        starterPromptTemplates,
      ),
    ).toThrow('Unsupported prompt template export version.');
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

    const result = parsePromptTemplateImport(rawValue, starterPromptTemplates);

    expect(result.summary).toEqual({
      created: 1,
      updated: 0,
      total: 1,
    });
    expect(result.importedTemplates).toHaveLength(1);
    expect(result.importedTemplates[0]?.description).toBe('Second revision wins');
  });

  it('treats id-less imports as new templates even when the name matches', () => {
    const rawValue = JSON.stringify([
      {
        name: existingReviewTemplate.name,
        description: 'Imported copy without a stored id',
        systemPrompt: existingReviewTemplate.systemPrompt,
        userPrompt: existingReviewTemplate.userPrompt,
        tags: existingReviewTemplate.tags,
        updatedAt: '2026-05-02T00:00:00.000Z',
      },
    ]);

    const result = parsePromptTemplateImport(rawValue, starterPromptTemplates);

    expect(result.summary).toEqual({
      created: 1,
      updated: 0,
      total: 1,
    });
    expect(result.importedTemplates[0]?.id).toMatch(/^code-review-assistant-/);
    expect(result.importedTemplates[0]?.id).not.toBe(existingReviewTemplate.id);
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
