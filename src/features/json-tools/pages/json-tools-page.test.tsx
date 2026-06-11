import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { JsonToolsPage } from '@/features/json-tools/pages/json-tools-page';

afterEach(() => {
  cleanup();
});

describe('JsonToolsPage', () => {
  it('formats, validates, and resets JSON input', () => {
    render(<JsonToolsPage />);

    const input = screen.getByLabelText('JSON input');

    fireEvent.change(input, {
      target: { value: '{"name":"dev-ai-toolkit"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Format' }));

    expect(screen.getByText('JSON formatted successfully.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'JSON formatted successfully.',
    );
    expect(screen.getByText(/"name": "dev-ai-toolkit"/)).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: '{bad-json' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid JSON');
    expect(screen.getByText('No output yet.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(
      screen.getByText('Cleared JSON input and output.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy result' })).toBeDisabled();
  });
});
