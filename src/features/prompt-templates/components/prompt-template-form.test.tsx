import { useState } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import type { PromptTemplateInput } from '@/types/prompt-template';

afterEach(() => {
  cleanup();
});

function PromptTemplateFormHarness({
  onSubmit,
}: {
  onSubmit: (value: PromptTemplateInput) => void;
}) {
  const navigate = useNavigate();

  return (
    <PromptTemplateForm
      mode="create"
      onCancel={() => navigate('/prompts')}
      onSubmit={(value) => {
        onSubmit(value);
        navigate('/prompts');
      }}
    />
  );
}

function renderForm(
  onSubmit: (value: PromptTemplateInput) => void = vi.fn(),
) {
  const router = createMemoryRouter(
    [
      {
        path: '/create-template',
        element: <PromptTemplateFormHarness onSubmit={onSubmit} />,
      },
      {
        path: '/prompts',
        element: <h1>Prompt template list</h1>,
      },
    ],
    { initialEntries: ['/create-template'] },
  );

  render(<RouterProvider router={router} />);

  return router;
}

const originalEditValue: PromptTemplateInput = {
  name: 'Original Review Template',
  description: 'Original description.',
  systemPrompt: 'Original system prompt.',
  userPrompt: 'Original user prompt.',
  tags: ['review'],
};

const externalEditValue: PromptTemplateInput = {
  name: 'Externally Updated Template',
  description: 'Updated in another tab.',
  systemPrompt: 'Updated system prompt.',
  userPrompt: 'Updated user prompt.',
  tags: ['review', 'updated'],
};

function ExternallyUpdatedEditFormHarness() {
  const [initialValue, setInitialValue] = useState(originalEditValue);

  return (
    <>
      <PromptTemplateForm
        mode="edit"
        initialValue={initialValue}
        onCancel={() => undefined}
        onSubmit={() => undefined}
      />
      <button
        type="button"
        onClick={() => setInitialValue(externalEditValue)}
      >
        Update externally
      </button>
    </>
  );
}

function renderExternallyUpdatedEditForm() {
  const router = createMemoryRouter(
    [
      {
        path: '/prompts/template-1/edit',
        element: <ExternallyUpdatedEditFormHarness />,
      },
    ],
    { initialEntries: ['/prompts/template-1/edit'] },
  );

  render(<RouterProvider router={router} />);
}

function fillRequiredFields() {
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
}

describe('PromptTemplateForm', () => {
  it('blocks submission when required fields are blank after trimming', () => {
    const handleSubmit = vi.fn();

    renderForm(handleSubmit);

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

  it('clears validation feedback when the user edits the form again', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '   ' },
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
    fireEvent.click(screen.getByRole('button', { name: 'Create template' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Debug Helper' },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('trims and deduplicates submitted tags', () => {
    const handleSubmit = vi.fn();

    renderForm(handleSubmit);

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

  it('keeps form values when saving to browser storage fails', () => {
    renderForm(() => {
      throw new Error('Storage quota exceeded.');
    });

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

    fireEvent.click(screen.getByRole('button', { name: 'Create template' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to save this template. Check that browser storage is available and try again.',
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Debug Helper');
    expect(screen.getByLabelText('User prompt')).toHaveValue(
      'Investigate {{issue}}.',
    );
  });

  it('lets the user stay on a dirty form or explicitly discard changes', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Work in progress' },
    });
    const backButton = screen.getByRole('button', { name: 'Back to list' });

    backButton.focus();
    fireEvent.click(backButton);

    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'Discard unsaved changes?',
    );
    expect(
      screen.getByRole('button', { name: 'Continue editing' }),
    ).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Continue editing' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Work in progress');
    await waitFor(() => expect(backButton).toHaveFocus());

    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Discard changes' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Prompt template list' }),
    ).toBeInTheDocument();
  });

  it('returns focus to the first field when no navigation trigger is available', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Work in progress' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Continue editing' }),
    );

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveFocus());
  });

  it('guards browser unload while the form has unsaved changes', () => {
    renderForm();

    const cleanUnloadEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanUnloadEvent);

    expect(cleanUnloadEvent.defaultPrevented).toBe(false);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Work in progress' },
    });
    const dirtyUnloadEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyUnloadEvent);

    expect(dirtyUnloadEvent.defaultPrevented).toBe(true);
  });

  it('does not block navigation after a successful save', async () => {
    const handleSubmit = vi.fn();

    renderForm(handleSubmit);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Create template' }));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(
      await screen.findByRole('heading', { name: 'Prompt template list' }),
    ).toBeInTheDocument();
  });

  it('refreshes a clean edit form when the saved template changes', () => {
    renderExternallyUpdatedEditForm();

    fireEvent.click(
      screen.getByRole('button', { name: 'Update externally' }),
    );

    expect(screen.getByLabelText('Name')).toHaveValue(
      'Externally Updated Template',
    );
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Updated in another tab.',
    );
    expect(
      screen.queryByText(/Saved template changed in another tab/),
    ).not.toBeInTheDocument();
  });

  it('preserves a local edit draft when the saved template changes', () => {
    renderExternallyUpdatedEditForm();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Keep this local draft' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Update externally' }),
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Keep this local draft');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Original description.',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved template changed in another tab. Your local draft is still here; review it before saving.',
    );
  });
});
