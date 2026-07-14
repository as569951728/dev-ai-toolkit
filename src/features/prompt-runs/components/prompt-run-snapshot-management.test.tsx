import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptRunSnapshotManagement } from '@/features/prompt-runs/components/prompt-run-snapshot-management';

afterEach(() => {
  cleanup();
});

describe('PromptRunSnapshotManagement', () => {
  it('returns to the initial state when deletion is cancelled', () => {
    const handleCancelDelete = vi.fn();

    render(
      <PromptRunSnapshotManagement
        deleteErrorMessage=""
        exportFeedback={null}
        isNoteDirty
        onCancelDelete={handleCancelDelete}
        onConfirmDelete={vi.fn()}
        onExport={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete run' }));

    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(
      'The unsaved note draft will also be discarded.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleCancelDelete).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('button', { name: 'Confirm delete' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete run' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
