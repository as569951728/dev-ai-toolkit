import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ApiBuilderPage } from '@/features/api-builder/pages/api-builder-page';

afterEach(() => {
  cleanup();
});

describe('ApiBuilderPage', () => {
  it('updates the resolved URL and resets the request draft', () => {
    render(<ApiBuilderPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Shape API requests before you wire them into code.',
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Base URL'), {
      target: { value: '/api/prompts?limit=10' },
    });

    expect(
      screen.getByText('/api/prompts?limit=10&workspace=dev-ai-toolkit'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(
      screen.getByText('Add a base URL to preview the final request URL.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('HTTP method')).toHaveValue('GET');
    expect(screen.getByText('No request body')).toBeInTheDocument();
  });
});
