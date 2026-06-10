import { afterEach } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
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

afterEach(() => {
  cleanup();
});

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
    expect(screen.getByText('Archived: visible')).toBeInTheDocument();
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

  it('does not offer the playground action for archived templates', () => {
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

    fireEvent.click(
      screen.getByRole('button', { name: 'Show archived templates (1)' }),
    );

    const archivedCard = screen.getByText('API Design Partner').closest('article');

    if (!archivedCard) {
      throw new Error('Expected the archived template card to render.');
    }

    expect(
      within(archivedCard).queryByRole('button', {
        name: 'Open in Playground',
      }),
    ).not.toBeInTheDocument();
  });

  it('hides archived-only tags until archived templates are visible', () => {
    const repository = createMemoryRepository([
      mockPromptTemplates[0]!,
      {
        ...mockPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
        tags: ['archived-only'],
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

    const tagSelect = screen.getByLabelText('Tag');

    expect(
      within(tagSelect).queryByRole('option', { name: 'archived-only' }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Show archived templates (1)' }),
    );

    expect(
      within(screen.getByLabelText('Tag')).getByRole('option', {
        name: 'archived-only',
      }),
    ).toBeInTheDocument();
  });

  it('preloads list filters and archived visibility from the route query', () => {
    const repository = createMemoryRepository([
      mockPromptTemplates[0]!,
      {
        ...mockPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      mockPromptTemplates[2]!,
    ]);

    render(
        <MemoryRouter
          initialEntries={[
          '/prompts?archived=1&tag=api&search=api',
        ]}
      >
        <PromptTemplatesProvider repository={repository}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole('button', { name: 'Hide archived templates' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByPlaceholderText('Search by name, tag, or prompt content'),
    ).toHaveValue('api');
    expect(screen.getByLabelText('Tag')).toHaveValue('api');
    expect(screen.getByText('Search: api')).toBeInTheDocument();
    expect(screen.getByText('Tag: api')).toBeInTheDocument();
    expect(screen.getByText('Archived: visible')).toBeInTheDocument();
    expect(screen.getByText('API Design Partner')).toBeInTheDocument();
    expect(
      screen.queryByText('Code Review Assistant'),
    ).not.toBeInTheDocument();
  });

  it('clears active filters from the empty state and restores the default list', () => {
    const repository = createMemoryRepository([
      mockPromptTemplates[0]!,
      {
        ...mockPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      mockPromptTemplates[2]!,
    ]);

    render(
      <MemoryRouter
        initialEntries={[
          '/prompts?archived=1&tag=review&search=api',
        ]}
      >
        <PromptTemplatesProvider repository={repository}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText('No templates match the current filters'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(
      screen.queryByText('No templates match the current filters'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Code Review Assistant')).toBeInTheDocument();
    expect(screen.queryByText('API Design Partner')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Archived: visible'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Search: api'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tag')).toHaveValue('all');
  });
});
