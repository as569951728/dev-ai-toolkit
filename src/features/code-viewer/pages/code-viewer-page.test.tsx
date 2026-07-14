import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';

import { createCodeViewerNavigationState } from '@/features/code-viewer/lib/code-viewer-navigation';
import { codeViewerSampleLeft } from '@/features/code-viewer/lib/code-viewer-utils';
import { CodeViewerPage } from '@/features/code-viewer/pages/code-viewer-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCodeViewer(
  initialEntry: NonNullable<MemoryRouterProps['initialEntries']>[number],
  runs: PromptRunRecord[] = [],
) {
  const repository: PromptRunRepository = {
    loadAll: () => [...runs],
    saveAll: () => undefined,
  };

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptRunsProvider repository={repository}>
        <Routes>
          <Route path="/code-viewer" element={<CodeViewerPage />} />
        </Routes>
      </PromptRunsProvider>
    </MemoryRouter>,
  );
}

describe('CodeViewerPage', () => {
  it('loads query string content and switches between compare and single modes', () => {
    renderCodeViewer(
      `/code-viewer?left=${encodeURIComponent('left output')}` +
        `&right=${encodeURIComponent('right output')}` +
        '&mode=compare&language=markdown',
    );

    expect(
      screen.getByRole('heading', {
        name: 'Read AI output, code snippets, and structured text more clearly.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Left output' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Right output' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('left output').length).toBeGreaterThan(0);
    expect(screen.getAllByText('right output').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('textbox', { name: 'Left input' }),
    ).toHaveValue('left output');
    expect(
      screen.getByRole('textbox', { name: 'Right input' }),
    ).toHaveValue('right output');
    expect(screen.getByLabelText('Language')).toHaveValue('markdown');
    expect(screen.getByRole('button', { name: 'Compare view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Single view' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Single view' }));

    expect(screen.getByRole('heading', { name: 'Output' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Right output' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Single view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Compare view' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('loads code comparisons from router state', () => {
    renderCodeViewer({
      pathname: '/code-viewer',
      state: createCodeViewerNavigationState({
        left: 'Private original prompt',
        right: 'Private rendered prompt',
        mode: 'compare',
        language: 'markdown',
      }),
    });

    expect(screen.getByRole('textbox', { name: 'Left input' })).toHaveValue(
      'Private original prompt',
    );
    expect(screen.getByRole('textbox', { name: 'Right input' })).toHaveValue(
      'Private rendered prompt',
    );
    expect(screen.getByLabelText('Language')).toHaveValue('markdown');
  });

  it('loads saved prompts from local Run History', () => {
    const run: PromptRunRecord = {
      id: 'imported/run #1',
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      templateVersion: 1,
      variables: {},
      systemPrompt: 'Private saved system prompt.',
      userPrompt: 'Private saved user prompt.',
      createdAt: '2026-07-13T08:00:00.000Z',
    };

    renderCodeViewer('/code-viewer?runId=imported%2Frun%20%231', [run]);

    expect(screen.getByRole('textbox', { name: 'Left input' })).toHaveValue(
      'Private saved system prompt.',
    );
    expect(screen.getByRole('textbox', { name: 'Right input' })).toHaveValue(
      'Private saved user prompt.',
    );
    expect(screen.getByLabelText('Language')).toHaveValue('markdown');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loaded saved prompts from Code Review Assistant.',
    );
    expect(
      screen.getByRole('link', { name: 'Back to saved run' }),
    ).toHaveAttribute('href', '/runs/imported%2Frun%20%231');
  });

  it('keeps the sample workspace available when a saved run is missing', () => {
    renderCodeViewer('/code-viewer?runId=missing-run');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The requested saved run is no longer available.',
    );
    expect(screen.getByRole('textbox', { name: 'Left input' })).toHaveValue(
      codeViewerSampleLeft,
    );
  });

  it('copies left content and announces the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderCodeViewer('/code-viewer?left=copyable-left&right=copyable-right');

    fireEvent.click(screen.getByRole('button', { name: 'Copy left' }));

    expect(writeText).toHaveBeenCalledWith('copyable-left');
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Left input copied.',
    );
  });

  it('falls back to plaintext when the language query is unsupported', () => {
    renderCodeViewer('/code-viewer?left=hello&language=text');

    expect(screen.getByLabelText('Language')).toHaveValue('plaintext');
    expect(
      screen.getByText((_, element) =>
        element?.className === 'panel__summary' &&
        (element.textContent?.includes('Use plaintext as the current content label') ??
          false),
      ),
    ).toBeInTheDocument();
  });

  it('announces copy failures when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    renderCodeViewer('/code-viewer?left=copyable-left');

    fireEvent.click(screen.getByRole('button', { name: 'Copy left' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to copy left input.',
    );
  });
});
