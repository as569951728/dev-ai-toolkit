import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';

import { createPromptDiffNavigationState } from '@/features/prompt-diff/lib/prompt-diff-navigation';
import { PromptDiffPage } from '@/features/prompt-diff/pages/prompt-diff-page';
import { promptDiffSampleLeft } from '@/features/prompt-diff/lib/prompt-diff-utils';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import { createPromptRunDetailNavigationState } from '@/features/prompt-runs/lib/prompt-run-links';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { PromptTemplatesProvider } from '@/features/prompt-templates/providers/prompt-templates-provider';
import type { PromptTemplateRepository } from '@/features/prompt-templates/repositories/prompt-template-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

const savedTemplate: PromptTemplate = {
  id: 'review-template',
  name: 'Review Template',
  description: 'Review code changes.',
  systemPrompt: 'Current system prompt v2.',
  userPrompt: 'Current user prompt v2.',
  tags: ['review'],
  version: 2,
  revisions: [
    {
      version: 1,
      updatedAt: '2026-05-06T09:00:00.000Z',
      name: 'Review Template',
      description: 'Review code changes.',
      systemPrompt: 'Original system prompt v1.',
      userPrompt: 'Original user prompt v1.',
      tags: ['review'],
    },
    {
      version: 2,
      updatedAt: '2026-05-07T09:00:00.000Z',
      name: 'Review Template',
      description: 'Review code changes.',
      systemPrompt: 'Current system prompt v2.',
      userPrompt: 'Current user prompt v2.',
      tags: ['review'],
    },
  ],
  archivedAt: null,
  updatedAt: '2026-05-07T09:00:00.000Z',
};

const savedRun: PromptRunRecord = {
  id: 'imported/run #1',
  templateId: savedTemplate.id,
  templateName: savedTemplate.name,
  templateVersion: 1,
  variables: {},
  systemPrompt: 'Generated system prompt.',
  userPrompt: 'Generated user prompt.',
  createdAt: '2026-05-08T09:00:00.000Z',
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createRunRepository(runs: PromptRunRecord[]): PromptRunRepository {
  return {
    loadAll: () => [...runs],
    saveAll: () => undefined,
  };
}

function createTemplateRepository(
  templates: PromptTemplate[],
): PromptTemplateRepository {
  return {
    loadAll: () => [...templates],
    saveAll: () => undefined,
  };
}

function renderPromptDiff(
  initialEntry: NonNullable<MemoryRouterProps['initialEntries']>[number],
  {
    runs = [],
    templates = [],
  }: {
    runs?: PromptRunRecord[];
    templates?: PromptTemplate[];
  } = {},
) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptTemplatesProvider repository={createTemplateRepository(templates)}>
        <PromptRunsProvider repository={createRunRepository(runs)}>
          <Routes>
            <Route
              path="/prompt-diff"
              element={
                <>
                  <PromptDiffPage />
                  <LocationProbe />
                </>
              }
            />
            <Route path="/runs/:runId" element={<LocationStateProbe />} />
          </Routes>
        </PromptRunsProvider>
      </PromptTemplatesProvider>
    </MemoryRouter>,
  );
}

function LocationProbe() {
  const location = useLocation();

  return <div data-testid="location-search">{location.search}</div>;
}

function LocationStateProbe() {
  const location = useLocation();

  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>;
}

describe('PromptDiffPage', () => {
  it('loads query string prompts and swaps comparison sides', () => {
    const leftPrompt = 'Review {{repo}}.';
    const rightPrompt = 'Review {{repo}} in {{module}}.';

    renderPromptDiff(
      `/prompt-diff?left=${encodeURIComponent(leftPrompt)}` +
        `&right=${encodeURIComponent(rightPrompt)}`,
    );

    const originalPromptInput = screen.getByRole('textbox', {
      name: 'Original prompt',
    });
    const revisedPromptInput = screen.getByRole('textbox', {
      name: 'Revised prompt',
    });

    expect(originalPromptInput).toHaveValue(leftPrompt);
    expect(revisedPromptInput).toHaveValue(rightPrompt);
    expect(screen.getByText('+1 / -0')).toBeInTheDocument();
    expect(screen.getByText('module')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Swap sides' }));

    expect(originalPromptInput).toHaveValue(rightPrompt);
    expect(revisedPromptInput).toHaveValue(leftPrompt);
  });

  it('clears legacy prompts from the URL after loading them', async () => {
    renderPromptDiff(
      '/prompt-diff?left=private-original&right=private-revised',
    );

    expect(screen.getByRole('textbox', { name: 'Original prompt' })).toHaveValue(
      'private-original',
    );
    expect(screen.getByRole('textbox', { name: 'Revised prompt' })).toHaveValue(
      'private-revised',
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toBeEmptyDOMElement();
    });
    expect(screen.getByRole('textbox', { name: 'Original prompt' })).toHaveValue(
      'private-original',
    );
  });

  it('loads prompt comparisons from router state', () => {
    renderPromptDiff({
      pathname: '/prompt-diff',
      state: createPromptDiffNavigationState({
        left: 'Private original prompt',
        right: 'Private revised prompt',
      }),
    });

    expect(screen.getByRole('textbox', { name: 'Original prompt' })).toHaveValue(
      'Private original prompt',
    );
    expect(screen.getByRole('textbox', { name: 'Revised prompt' })).toHaveValue(
      'Private revised prompt',
    );
  });

  it('shows blank line changes in the diff summary', () => {
    renderPromptDiff('/prompt-diff');

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Original prompt' }),
      {
        target: { value: 'First instruction.\nSecond instruction.' },
      },
    );
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Revised prompt' }),
      {
        target: { value: 'First instruction.\n\n   \nSecond instruction.' },
      },
    );

    expect(screen.getByText('2 lines')).toBeInTheDocument();
    expect(screen.getByText('4 lines')).toBeInTheDocument();
    expect(screen.getAllByText('(blank line)')).toHaveLength(2);
  });

  it('loads a saved run comparison from local data', () => {
    const historyPath = '/runs?templateId=review-template&q=generated';

    renderPromptDiff({
      pathname: '/prompt-diff',
      search: '?runId=imported%2Frun%20%231',
      state: createPromptRunDetailNavigationState(historyPath),
    }, {
      runs: [savedRun],
      templates: [savedTemplate],
    });

    expect(screen.getByRole('textbox', { name: 'Original prompt' })).toHaveValue(
      'Original system prompt v1.\n\nOriginal user prompt v1.',
    );
    expect(screen.getByRole('textbox', { name: 'Revised prompt' })).toHaveValue(
      'Generated system prompt.\n\nGenerated user prompt.',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loaded Review Template v1 from local Run History.',
    );
    expect(screen.getByRole('link', { name: 'Back to saved run' })).toHaveAttribute(
      'href',
      '/runs/imported%2Frun%20%231',
    );

    fireEvent.click(screen.getByRole('link', { name: 'Back to saved run' }));

    expect(screen.getByTestId('location-state')).toHaveTextContent(
      JSON.stringify(createPromptRunDetailNavigationState(historyPath)),
    );
  });

  it('explains when a requested saved run is unavailable', () => {
    renderPromptDiff('/prompt-diff?runId=missing-run');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The requested saved run is no longer available. Loaded the sample comparison instead.',
    );
    expect(screen.getByRole('textbox', { name: 'Original prompt' })).toHaveValue(
      promptDiffSampleLeft,
    );
  });

  it('explains when the source template is unavailable', () => {
    const run: PromptRunRecord = {
      ...savedRun,
      id: 'orphaned-run',
      templateId: 'removed-template',
      templateName: 'Removed Template',
    };

    renderPromptDiff('/prompt-diff?runId=orphaned-run', { runs: [run] });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The source template for this saved run is no longer available. Loaded the sample comparison instead.',
    );
  });

  it('explains when the saved source revision is unavailable', () => {
    const template: PromptTemplate = {
      ...savedTemplate,
      revisions: [savedTemplate.revisions[1]!],
    };
    const run: PromptRunRecord = {
      ...savedRun,
      id: 'old-run',
    };

    renderPromptDiff('/prompt-diff?runId=old-run', {
      runs: [run],
      templates: [template],
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The saved source revision is no longer available. Loaded the sample comparison instead.',
    );
  });

  it('copies the left prompt and announces the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderPromptDiff('/prompt-diff?left=original-prompt&right=revised-prompt');

    fireEvent.click(screen.getByRole('button', { name: 'Copy left prompt' }));

    expect(writeText).toHaveBeenCalledWith('original-prompt');
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Left prompt copied.',
    );
  });

  it('announces prompt copy failures when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    renderPromptDiff('/prompt-diff?left=original-prompt');

    fireEvent.click(screen.getByRole('button', { name: 'Copy left prompt' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to copy left prompt.',
    );
  });
});
