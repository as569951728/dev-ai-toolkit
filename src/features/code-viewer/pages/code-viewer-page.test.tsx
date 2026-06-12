import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { CodeViewerPage } from '@/features/code-viewer/pages/code-viewer-page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCodeViewer(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/code-viewer" element={<CodeViewerPage />} />
      </Routes>
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
    expect(screen.getByLabelText('Language')).toHaveValue('markdown');

    fireEvent.click(screen.getByRole('button', { name: 'Single view' }));

    expect(screen.getByRole('heading', { name: 'Output' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Right output' }),
    ).not.toBeInTheDocument();
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
