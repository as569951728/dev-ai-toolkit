import type { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePromptPlayground } from '@/features/prompt-playground/hooks/use-prompt-playground';
import { buildPromptTemplateFromInput } from '@/features/prompt-templates/lib/prompt-template-versioning';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type { PromptTemplate } from '@/types/prompt-template';

function createTemplateRepository(
  templates: PromptTemplate[] = mockPromptTemplates,
): PromptTemplateRepository {
  return {
    loadAll: () => [...templates],
    saveAll: () => undefined,
  };
}

function createWrapper(repository: PromptTemplateRepository) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <PromptTemplatesProvider repository={repository}>
        {children}
      </PromptTemplatesProvider>
    );
  };
}

function createArchivedTemplate() {
  return buildPromptTemplateFromInput({
    id: 'archived-template',
    input: {
      name: 'Archived Template',
      description: 'No longer used in active prompt runs.',
      systemPrompt: 'Archived system prompt',
      userPrompt: 'Archived user prompt',
      tags: ['archived'],
    },
    version: 1,
    updatedAt: '2026-05-09T08:00:00.000Z',
    archivedAt: '2026-05-10T08:00:00.000Z',
  });
}

describe('usePromptPlayground', () => {
  it('normalizes a missing initial template id to the first available template', () => {
    const fallbackTemplate = mockPromptTemplates[0]!;

    const { result } = renderHook(
      () => usePromptPlayground('missing-template'),
      {
        wrapper: createWrapper(createTemplateRepository()),
      },
    );

    expect(result.current.selectedTemplate?.id).toBe(fallbackTemplate.id);
    expect(result.current.selectedTemplateId).toBe(fallbackTemplate.id);
  });

  it('excludes archived templates from the selectable playground templates', () => {
    const archivedTemplate = createArchivedTemplate();

    const { result } = renderHook(() => usePromptPlayground(), {
      wrapper: createWrapper(
        createTemplateRepository([archivedTemplate, ...mockPromptTemplates]),
      ),
    });

    expect(result.current.templates.map((template) => template.id)).not.toContain(
      archivedTemplate.id,
    );
  });

  it('falls back to the first active template when the initial template is archived', () => {
    const archivedTemplate = createArchivedTemplate();
    const fallbackTemplate = mockPromptTemplates[0]!;

    const { result } = renderHook(
      () => usePromptPlayground(archivedTemplate.id),
      {
        wrapper: createWrapper(
          createTemplateRepository([archivedTemplate, ...mockPromptTemplates]),
        ),
      },
    );

    expect(result.current.selectedTemplate?.id).toBe(fallbackTemplate.id);
    expect(result.current.selectedTemplateId).toBe(fallbackTemplate.id);
  });
});
