import { describe, expect, it } from 'vitest';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import {
  collectPromptTemplateTags,
  createPromptTemplate,
  deletePromptTemplate,
  duplicatePromptTemplate,
  importPromptTemplates,
  restorePromptTemplateRevision,
  sortPromptTemplates,
  updatePromptTemplate,
} from '@/features/prompt-templates/services/prompt-template-service';

function createMemoryRepository(
  initialTemplates = mockPromptTemplates,
): PromptTemplateRepository & { snapshot: () => typeof initialTemplates } {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
    snapshot: () => [...templates],
  };
}

describe('prompt-template-service', () => {
  it('sorts templates and collects tags', () => {
    const sorted = sortPromptTemplates(mockPromptTemplates);
    const tags = collectPromptTemplateTags(sorted);

    expect(
      new Date(sorted[0]!.updatedAt).getTime() >=
        new Date(sorted[1]!.updatedAt).getTime(),
    ).toBe(true);
    expect(tags).toContain('api');
    expect(tags).toContain('quality');
  });

  it('creates, updates, duplicates, deletes, and imports templates through the repository', () => {
    const repository = createMemoryRepository();

    const createResult = createPromptTemplate(repository, repository.loadAll(), {
      name: 'Release Note Writer',
      description: 'Turn engineering changes into release notes.',
      systemPrompt: 'You are documenting {{release_scope}} changes.',
      userPrompt: 'Draft release notes for {{release_scope}}.',
      tags: ['release'],
    });

    expect(createResult.template.id).toContain('release-note-writer');
    expect(createResult.template.version).toBe(1);
    expect(createResult.template.revisions).toHaveLength(1);
    expect(repository.snapshot()).toHaveLength(mockPromptTemplates.length + 1);

    const updateResult = updatePromptTemplate(
      repository,
      repository.loadAll(),
      createResult.template.id,
      {
        name: createResult.template.name,
        description: 'Updated release note prompt',
        systemPrompt: createResult.template.systemPrompt,
        userPrompt: createResult.template.userPrompt,
        tags: createResult.template.tags,
      },
    );

    expect(updateResult.template).not.toBeNull();
    expect(
      repository
        .snapshot()
        .find((template) => template.id === createResult.template.id)
        ?.description,
    ).toBe('Updated release note prompt');
    expect(
      repository
        .snapshot()
        .find((template) => template.id === createResult.template.id)?.version,
    ).toBe(2);

    const duplicateResult = duplicatePromptTemplate(
      repository,
      repository.loadAll(),
      createResult.template.id,
    );

    expect(duplicateResult.template?.name).toContain('Copy');
    expect(duplicateResult.template?.version).toBe(1);

    const restoreResult = restorePromptTemplateRevision(
      repository,
      repository.loadAll(),
      createResult.template.id,
      1,
    );

    expect(restoreResult.template).not.toBeNull();
    expect(
      repository
        .snapshot()
        .find((template) => template.id === createResult.template.id)?.version,
    ).toBe(3);
    expect(
      repository
        .snapshot()
        .find((template) => template.id === createResult.template.id)
        ?.description,
    ).toBe('Turn engineering changes into release notes.');
    expect(
      repository
        .snapshot()
        .find((template) => template.id === createResult.template.id)?.revisions
        .length,
    ).toBe(3);

    const importedTemplate = {
      ...mockPromptTemplates[0]!,
      description: 'Imported update',
    };

    const importResult = importPromptTemplates(
      repository,
      repository.loadAll(),
      [importedTemplate],
      {
        created: 0,
        updated: 1,
        total: 1,
      },
    );

    expect(importResult.summary.updated).toBe(1);
    expect(
      repository
        .snapshot()
        .find((template) => template.id === importedTemplate.id)?.description,
    ).toBe('Imported update');

    const afterDelete = deletePromptTemplate(
      repository,
      repository.loadAll(),
      createResult.template.id,
    );

    expect(
      afterDelete.some((template) => template.id === createResult.template.id),
    ).toBe(false);
  });
});
