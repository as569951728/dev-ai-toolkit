import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { starterPromptTemplates } from '@/features/prompt-templates/seed/prompt-templates';
import { buildPromptTemplateDetailPath } from '@/features/prompt-templates/lib/prompt-template-links';
import { PromptTemplateDetailPage } from '@/features/prompt-templates/pages/prompt-template-detail-page';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

function createTemplateRepository(
  initialTemplates = starterPromptTemplates,
): PromptTemplateRepository & { snapshot: () => PromptTemplate[] } {
  let templates = [...initialTemplates];

  return {
    loadAll: () => [...templates],
    saveAll: (nextTemplates) => {
      templates = [...nextTemplates];
    },
    snapshot: () => [...templates],
  };
}

function createRunRepository(
  initialRuns: PromptRunRecord[] = [],
): PromptRunRepository {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
  };
}

afterEach(() => {
  cleanup();
});

describe('PromptTemplateDetailPage', () => {
  it('opens a template whose ID contains URL-sensitive characters', () => {
    const template = {
      ...starterPromptTemplates[0]!,
      id: 'imported/template #1',
    };

    render(
      <MemoryRouter initialEntries={[buildPromptTemplateDetailPath(template.id)]}>
        <PromptTemplatesProvider repository={createTemplateRepository([template])}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
              <Route
                path="/prompts/:promptId/edit"
                element={<div>Template Edit Destination</div>}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: template.name }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Template Edit Destination')).toBeInTheDocument();
  });

  it('explains when a linked prompt template is not available', () => {
    render(
      <MemoryRouter initialEntries={['/prompts/missing-template']}>
        <PromptTemplatesProvider repository={createTemplateRepository([])}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Template not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The prompt template may have been removed from local storage.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Prompt Templates' }),
    ).toHaveAttribute('href', '/prompts');
  });

  it('opens a recent run from the template detail activity list', () => {
    const template = starterPromptTemplates[0]!;
    const run: PromptRunRecord = {
      id: 'imported/run #1',
      templateId: template.id,
      templateName: template.name,
      templateVersion: template.version,
      variables: {
        component: 'PromptTemplateDetail',
      },
      systemPrompt: template.systemPrompt,
      userPrompt: template.userPrompt,
      createdAt: '2026-06-12T08:00:00.000Z',
    };

    render(
      <MemoryRouter initialEntries={[`/prompts/${template.id}`]}>
        <PromptTemplatesProvider repository={createTemplateRepository([template])}>
          <PromptRunsProvider repository={createRunRepository([run])}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
              <Route
                path="/runs/:runId"
                element={<div>Run Detail Destination</div>}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View run details' }));

    expect(screen.getByText('Run Detail Destination')).toBeInTheDocument();
  });

  it('does not offer the playground action for an archived prompt template', () => {
    const archivedTemplate = {
      ...starterPromptTemplates[0]!,
      archivedAt: '2026-05-07T08:00:00.000Z',
    };
    const templateRepository = createTemplateRepository([archivedTemplate]);

    render(
      <MemoryRouter initialEntries={[`/prompts/${archivedTemplate.id}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: 'Open in Playground' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
  });

  it('archives a prompt template from the detail page', () => {
    const templateId = starterPromptTemplates[0]!.id;
    const templateRepository = createTemplateRepository();

    render(
      <MemoryRouter initialEntries={[`/prompts/${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));

    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
    expect(
      templateRepository.snapshot().find((template) => template.id === templateId)
        ?.archivedAt,
    ).not.toBeNull();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('confirms before restoring a historical template revision', () => {
    const baseTemplate = starterPromptTemplates[0]!;
    const currentRevision = {
      ...baseTemplate.revisions[0]!,
      version: 2,
      updatedAt: '2026-05-08T08:00:00.000Z',
      description: 'Current template description.',
    };
    const template: PromptTemplate = {
      ...baseTemplate,
      version: currentRevision.version,
      updatedAt: currentRevision.updatedAt,
      description: currentRevision.description,
      revisions: [...baseTemplate.revisions, currentRevision],
    };
    const templateRepository = createTemplateRepository([template]);

    render(
      <MemoryRouter initialEntries={[`/prompts/${template.id}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Restore as current' }),
    );

    expect(
      screen.getByRole('dialog', { name: 'Restore version v1?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(templateRepository.snapshot()[0]?.version).toBe(2);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(templateRepository.snapshot()[0]?.version).toBe(2);

    fireEvent.click(
      screen.getByRole('button', { name: 'Restore as current' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Restore version v1' }),
    );

    expect(templateRepository.snapshot()[0]).toMatchObject({
      version: 3,
      description: baseTemplate.description,
    });
    expect(screen.getByText('Current version v3')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting a prompt template', () => {
    const templateRepository = createTemplateRepository();
    const templateId = starterPromptTemplates[0]!.id;

    render(
      <MemoryRouter initialEntries={[`/prompts/${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
              <Route
                path="/prompts"
                element={<div>Prompt List Destination</div>}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(
      screen.getByText(
        'Deleting this template will not remove its saved run snapshots from Run History.',
      ),
    ).toBeInTheDocument();
    expect(
      templateRepository.snapshot().some((template) => template.id === templateId),
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByText(/will not remove its saved run snapshots/),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByText('Prompt List Destination')).toBeInTheDocument();
    expect(
      templateRepository.snapshot().some((template) => template.id === templateId),
    ).toBe(false);
  });

  it('keeps the detail open when browser storage rejects a delete', () => {
    const templateId = starterPromptTemplates[0]!.id;
    const templateRepository: PromptTemplateRepository = {
      loadAll: () => [...starterPromptTemplates],
      saveAll: () => {
        throw new Error('Storage quota exceeded.');
      },
    };

    render(
      <MemoryRouter initialEntries={[`/prompts/${templateId}`]}>
        <PromptTemplatesProvider repository={templateRepository}>
          <PromptRunsProvider repository={createRunRepository()}>
            <Routes>
              <Route
                path="/prompts/:promptId"
                element={<PromptTemplateDetailPage />}
              />
              <Route
                path="/prompts"
                element={<div>Prompt List Destination</div>}
              />
            </Routes>
          </PromptRunsProvider>
        </PromptTemplatesProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to update this template. Check that browser storage is available and try again.',
    );
    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Prompt List Destination'),
    ).not.toBeInTheDocument();
  });
});
