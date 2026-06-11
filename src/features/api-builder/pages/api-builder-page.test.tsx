import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiBuilderPage } from '@/features/api-builder/pages/api-builder-page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
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

  it('shows a curl command preview for the current request draft', () => {
    render(<ApiBuilderPage />);

    expect(
      screen.getByRole('heading', { name: 'cURL command' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes(
          "curl -X POST 'https://api.example.com/v1/prompts/render?workspace=dev-ai-toolkit'",
        ),
      ),
    ).toBeInTheDocument();
  });

  it('copies the generated curl command', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ApiBuilderPage />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy cURL command' }),
    );

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        "curl -X POST 'https://api.example.com/v1/prompts/render?workspace=dev-ai-toolkit'",
      ),
    );
  });
});
