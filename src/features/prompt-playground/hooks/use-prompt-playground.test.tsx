import type { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePromptPlayground } from '@/features/prompt-playground/hooks/use-prompt-playground';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';

function createTemplateRepository(): PromptTemplateRepository {
  return {
    loadAll: () => [...mockPromptTemplates],
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
});
