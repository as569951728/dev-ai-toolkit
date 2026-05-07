import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';

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

function TestConsumer() {
  const {
    templates,
    createTemplate,
    duplicateTemplate,
    archiveTemplate,
    restoreArchivedTemplate,
  } = usePromptTemplates();
  const firstTemplate = templates[0];

  return (
    <div>
      <span data-testid="count">{templates.length}</span>
      <span data-testid="first-template">{firstTemplate?.name ?? 'none'}</span>
      <button
        type="button"
        onClick={() => {
          createTemplate({
            name: 'Incident Follow-up',
            description: 'Summarize incident next steps.',
            systemPrompt: 'You are working on {{incident_name}}.',
            userPrompt: 'List next steps for {{incident_name}}.',
            tags: ['incident'],
          });
        }}
      >
        Create
      </button>
      <button
        type="button"
        onClick={() => {
          duplicateTemplate(mockPromptTemplates[0]!.id);
        }}
      >
        Duplicate
      </button>
      <button
        type="button"
        onClick={() => {
          archiveTemplate(mockPromptTemplates[0]!.id);
        }}
      >
        Archive
      </button>
      <button
        type="button"
        onClick={() => {
          restoreArchivedTemplate(mockPromptTemplates[0]!.id);
        }}
      >
        Restore
      </button>
    </div>
  );
}

describe('PromptTemplatesProvider', () => {
  it('uses the injected repository and persists state changes through context actions', () => {
    const repository = createMemoryRepository();

    render(
      <PromptTemplatesProvider repository={repository}>
        <TestConsumer />
      </PromptTemplatesProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('3');

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByTestId('count')).toHaveTextContent('4');
    expect(repository.snapshot()).toHaveLength(4);
    expect(screen.getByTestId('first-template')).toHaveTextContent(
      'Incident Follow-up',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }));

    expect(screen.getByTestId('count')).toHaveTextContent('5');
    expect(repository.snapshot()[0]?.name).toContain('Copy');

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));

    expect(
      repository.snapshot().find((template) => template.id === mockPromptTemplates[0]!.id)
        ?.archivedAt,
    ).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));

    expect(
      repository.snapshot().find((template) => template.id === mockPromptTemplates[0]!.id)
        ?.archivedAt,
    ).toBeNull();
  });
});
