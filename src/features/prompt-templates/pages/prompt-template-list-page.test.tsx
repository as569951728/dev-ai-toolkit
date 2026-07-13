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
import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';

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
  initialTemplates = starterPromptTemplates,
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
  vi.restoreAllMocks();
});

describe('PromptTemplateListPage', () => {
  it('announces template export feedback', () => {
    const createObjectURL = vi.fn(() => 'blob:prompt-template-export');
    const revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });

    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={createMemoryRepository()}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      `Exported ${starterPromptTemplates.length} templates to JSON.`,
    );
    expect(click).toHaveBeenCalled();
  });

  it('announces a failed template export and allows retrying', () => {
    const createObjectURL = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('Downloads are unavailable.');
      })
      .mockReturnValue('blob:prompt-template-export');
    const revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });

    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={createMemoryRepository()}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to export prompt templates. Please try again.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      `Exported ${starterPromptTemplates.length} templates to JSON.`,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:prompt-template-export',
    );
  });

  it('announces invalid template import feedback as an alert', async () => {
    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={createMemoryRepository()}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    const fileInput = screen.getByLabelText('Import prompt templates JSON');

    const invalidFile = new File(['not json'], 'broken-template.json', {
      type: 'application/json',
    });

    fireEvent.change(fileInput, {
      target: {
        files: [invalidFile],
      },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid file format. Expected a template array or an exported dev-ai-toolkit payload.',
    );
  });

  it('discloses invalid records skipped from a mixed template import', async () => {
    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={createMemoryRepository()}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    const mixedFile = new File(
      [
        JSON.stringify([
          {
            ...starterPromptTemplates[0],
            description: 'Imported template update.',
          },
          {
            id: 'invalid-template',
            name: '',
          },
        ]),
      ],
      'mixed-templates.json',
      { type: 'application/json' },
    );

    fireEvent.change(screen.getByLabelText('Import prompt templates JSON'), {
      target: { files: [mixedFile] },
    });

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Imported 1 template: 0 created, 1 updated. 1 skipped.',
    );
  });

  it('accepts JSON template import files by MIME type or extension', () => {
    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={createMemoryRepository()}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByLabelText('Import prompt templates JSON'),
    ).toHaveAttribute('accept', 'application/json,.json');
    expect(
      screen.getByText(
        /Imported templates with matching IDs replace the local records/,
      ),
    ).toBeInTheDocument();
  });

  it('hides archived templates by default and reveals them on demand', () => {
    const repository = createMemoryRepository([
      starterPromptTemplates[0]!,
      {
        ...starterPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      starterPromptTemplates[2]!,
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
      `/runs?templateId=${starterPromptTemplates[0]!.id}`,
    );
  });

  it('does not offer the playground action for archived templates', () => {
    const repository = createMemoryRepository([
      starterPromptTemplates[0]!,
      {
        ...starterPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      starterPromptTemplates[2]!,
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
      starterPromptTemplates[0]!,
      {
        ...starterPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
        tags: ['archived-only'],
      },
      starterPromptTemplates[2]!,
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
      starterPromptTemplates[0]!,
      {
        ...starterPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      starterPromptTemplates[2]!,
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

  it('preserves spaces while entering a multi-word search', () => {
    render(
      <MemoryRouter>
        <PromptTemplatesProvider repository={createMemoryRepository()}>
          <PromptTemplateListPage />
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    const searchInput = screen.getByLabelText('Search prompt templates');

    fireEvent.change(searchInput, {
      target: { value: 'code ' },
    });

    expect(searchInput).toHaveValue('code ');
    expect(screen.getByText('Search: code')).toBeInTheDocument();

    fireEvent.change(searchInput, {
      target: { value: 'code review' },
    });

    expect(searchInput).toHaveValue('code review');
    expect(screen.getByText('Code Review Assistant')).toBeInTheDocument();
  });

  it('clears active filters from the empty state and restores the default list', () => {
    const repository = createMemoryRepository([
      starterPromptTemplates[0]!,
      {
        ...starterPromptTemplates[1]!,
        archivedAt: '2026-05-07T08:00:00.000Z',
      },
      starterPromptTemplates[2]!,
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
