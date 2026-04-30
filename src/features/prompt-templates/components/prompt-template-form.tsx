import { useState } from 'react';

import type {
  PromptTemplate,
  PromptTemplateInput,
} from '@/types/prompt-template';

interface PromptTemplateFormProps {
  mode: 'create' | 'edit';
  initialValue?: PromptTemplate | null;
  onSubmit: (value: PromptTemplateInput) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  tags: string;
}

function createInitialState(initialValue?: PromptTemplate | null): FormState {
  return {
    name: initialValue?.name ?? '',
    description: initialValue?.description ?? '',
    systemPrompt: initialValue?.systemPrompt ?? '',
    userPrompt: initialValue?.userPrompt ?? '',
    tags: initialValue?.tags.join(', ') ?? '',
  };
}

export function PromptTemplateForm({
  mode,
  initialValue,
  onSubmit,
  onCancel,
}: PromptTemplateFormProps) {
  const [formState, setFormState] = useState<FormState>(() =>
    createInitialState(initialValue),
  );

  const handleChange =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const value = event.target.value;
      setFormState((currentState) => ({
        ...currentState,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: PromptTemplateInput = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      systemPrompt: formState.systemPrompt.trim(),
      userPrompt: formState.userPrompt.trim(),
      tags: formState.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    onSubmit(payload);
  };

  return (
    <section className="panel">
      <div className="panel__header panel__header--stacked">
        <div>
          <p className="eyebrow">
            {mode === 'create' ? 'New Template' : 'Edit Template'}
          </p>
          <h1>{mode === 'create' ? 'Create a prompt template' : initialValue?.name}</h1>
          <p className="panel__summary">
            Capture a reusable prompt structure for common AI engineering
            workflows.
          </p>
        </div>

        <button className="ghost-button" type="button" onClick={onCancel}>
          Back to list
        </button>
      </div>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            required
            value={formState.name}
            onChange={handleChange('name')}
            placeholder="Prompt template name"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <input
            required
            value={formState.description}
            onChange={handleChange('description')}
            placeholder="Short summary of when to use this template"
          />
        </label>

        <label className="field field--full">
          <span>System prompt</span>
          <textarea
            required
            rows={6}
            value={formState.systemPrompt}
            onChange={handleChange('systemPrompt')}
            placeholder="Define the role, rules, and response style"
          />
        </label>

        <label className="field field--full">
          <span>User prompt</span>
          <textarea
            required
            rows={8}
            value={formState.userPrompt}
            onChange={handleChange('userPrompt')}
            placeholder="Add the user-side instructions or request pattern"
          />
        </label>

        <label className="field field--full">
          <span>Tags</span>
          <input
            value={formState.tags}
            onChange={handleChange('tags')}
            placeholder="debugging, api, review"
          />
        </label>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            {mode === 'create' ? 'Create template' : 'Save changes'}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
