import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';

afterEach(() => {
  cleanup();
});

describe('PromptTemplateForm', () => {
  it('blocks submission when required fields are blank after trimming', () => {
    const handleSubmit = vi.fn();

    render(
      <PromptTemplateForm
        mode="create"
        onCancel={vi.fn()}
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Debug a failing workflow' },
    });
    fireEvent.change(screen.getByLabelText('System prompt'), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByLabelText('User prompt'), {
      target: { value: 'Investigate {{issue}}.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create template' }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent('Name and system prompt are required.');
  });

  it('trims and deduplicates submitted tags', () => {
    const handleSubmit = vi.fn();

    render(
      <PromptTemplateForm
        mode="create"
        onCancel={vi.fn()}
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Debug Helper' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Debug a failing workflow' },
    });
    fireEvent.change(screen.getByLabelText('System prompt'), {
      target: { value: 'You are helping debug {{issue}}.' },
    });
    fireEvent.change(screen.getByLabelText('User prompt'), {
      target: { value: 'Investigate {{issue}}.' },
    });
    fireEvent.change(screen.getByLabelText('Tags'), {
      target: { value: 'debugging, api, debugging,  api  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create template' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Debug Helper',
      description: 'Debug a failing workflow',
      systemPrompt: 'You are helping debug {{issue}}.',
      userPrompt: 'Investigate {{issue}}.',
      tags: ['debugging', 'api'],
    });
  });
});
