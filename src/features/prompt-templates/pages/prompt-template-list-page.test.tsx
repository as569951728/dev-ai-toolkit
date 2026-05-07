import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { PromptTemplateListPage } from '@/features/prompt-templates/pages/prompt-template-list-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createMemoryRepository(
  initialTemplates = mockPromptTemplates,
): PromptTemplateRepository {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
  };
}

describe('PromptTemplateListPage', () => {
  it('hides archived templates by default and reveals them on demand', () => {
    const repository = createMemoryRepository([
      mockPromptTemplates[0]!,
      {
        ...mockPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      mockPromptTemplates[2]!,
    ]);

    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={repository}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Code Review Assistant')).toBeInTheDocument();
    expect(screen.queryByText('API Design Partner')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Show archived templates (1)' }),
    );

    expect(screen.getByText('API Design Partner')).toBeInTheDocument();
    expect(screen.getByText('Archived May 7, 2026')).toBeInTheDocument();
  });

  it('opens filtered run history from a template card', () => {
    const repository = createMemoryRepository();
    mockNavigate.mockReset();

    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={repository}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getAllByRole('button', { name: 'View run history' })[0]!,
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      `/runs?templateId=${mockPromptTemplates[0]!.id}`,
    );
  });
});
