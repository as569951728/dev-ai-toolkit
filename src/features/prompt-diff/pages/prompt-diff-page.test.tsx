import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PromptDiffPage } from '@/features/prompt-diff/pages/prompt-diff-page';

afterEach(() => {
  cleanup();
});

function renderPromptDiff(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/prompt-diff" element={<PromptDiffPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PromptDiffPage', () => {
  it('loads query string prompts and swaps comparison sides', () => {
    const leftPrompt = 'Review {{repo}}.';
    const rightPrompt = 'Review {{repo}} in {{module}}.';

    renderPromptDiff(
      `/prompt-diff?left=${encodeURIComponent(leftPrompt)}` +
        `&right=${encodeURIComponent(rightPrompt)}`,
    );

    const textareas = screen.getAllByRole('textbox');

    expect(textareas[0]).toHaveValue(leftPrompt);
    expect(textareas[1]).toHaveValue(rightPrompt);
    expect(screen.getByText('+1 / -0')).toBeInTheDocument();
    expect(screen.getByText('module')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Swap sides' }));

    expect(textareas[0]).toHaveValue(rightPrompt);
    expect(textareas[1]).toHaveValue(leftPrompt);
  });
});
