import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { mockPromptTemplates } from '@/features/prompt-templates/mock/prompts';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import { PromptRunDetailPage } from '@/features/prompt-runs/pages/prompt-run-detail-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';

function createTemplateRepository(
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

function createRunRepository(initialRuns: PromptRunRecord[]): PromptRunRepository {
  let runs = [...initialRuns];

  return {
    loadAll: () => [...runs],
    saveAll: (nextRuns) => {
      runs = [...nextRuns];
    },
  };
}

function createNoteRepository(
  initialNotes: PromptRunNote[] = [],
): PromptRunNoteRepository & { snapshot: () => PromptRunNote[] } {
  let notes = [...initialNotes];

  return {
    loadAll: () => [...notes],
    saveAll: (nextNotes) => {
      notes = [...nextNotes];
    },
    snapshot: () => [...notes],
  };
}

function renderRunDetail(
  initialEntry: string,
  initialRuns: PromptRunRecord[],
  templateRepository = createTemplateRepository(),
  noteRepository = createNoteRepository(),
) {
  const runRepository = createRunRepository(initialRuns);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={templateRepository}>
        <PromptRunsProvider repository={runRepository}>
          <PromptRunNotesProvider repository={noteRepository}>
            <Routes>
              <Route path="/runs/:runId" element={<PromptRunDetailPage />} />
            </Routes>
          </PromptRunNotesProvider>
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );

  return {
    noteRepository,
  };
}

afterEach(() => {
  cleanup();
});

describe('PromptRunDetailPage', () => {
  it('shows a saved run with variables, prompts, and source template link', () => {
    renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: mockPromptTemplates[0]!.id,
        templateName: mockPromptTemplates[0]!.name,
        templateVersion: 2,
        variables: { repository_name: 'dev-ai-toolkit' },
        systemPrompt: 'Review the code carefully.',
        userPrompt: 'Focus on bugs and missing tests.',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    expect(
      screen.getByRole('heading', { name: 'Code Review Assistant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('repository_name')).toBeInTheDocument();
    expect(screen.getByText('dev-ai-toolkit')).toBeInTheDocument();
    expect(screen.getByText('Review the code carefully.')).toBeInTheDocument();
    expect(
      screen.getByText('Focus on bugs and missing tests.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View source template' }),
    ).toHaveAttribute('href', `/prompts/${mockPromptTemplates[0]!.id}`);
    expect(
      screen.getByRole('link', { name: 'Open output in Code Viewer' }),
    ).toHaveAttribute(
      'href',
      `/code-viewer?left=${encodeURIComponent('Review the code carefully.')}&right=${encodeURIComponent('Focus on bugs and missing tests.')}&mode=compare&language=markdown`,
    );
    expect(
      screen.getByRole('link', { name: 'Compare with source' }),
    ).toHaveAttribute('href', expect.stringContaining('/prompt-diff?left='));
  });

  it('saves a maintenance note for the current run', () => {
    const { noteRepository } = renderRunDetail('/runs/run-1', [
      {
        id: 'run-1',
        templateId: mockPromptTemplates[0]!.id,
        templateName: mockPromptTemplates[0]!.name,
        templateVersion: 2,
        variables: {},
        systemPrompt: 'System',
        userPrompt: 'User',
        createdAt: '2026-05-07T09:00:00.000Z',
      },
    ]);

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Good baseline for future review prompts.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(screen.getByText('Note saved.')).toBeInTheDocument();
    expect(noteRepository.snapshot()[0]).toMatchObject({
      runId: 'run-1',
      body: 'Good baseline for future review prompts.',
    });
  });

  it('shows a not-found state when the run is missing', () => {
    renderRunDetail('/runs/missing-run', []);

    expect(screen.getByText('Run not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Run History' }),
    ).toHaveAttribute('href', '/runs');
  });
});
