import { useEffect, useRef, useState } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

import type { PromptTemplateInput } from '@/types/prompt-template';

interface PromptTemplateFormProps {
  externalChangeMessage?: string;
  mode: 'create' | 'edit';
  initialValue?: PromptTemplateInput | null;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (value: PromptTemplateInput) => void;
  onCancel: () => void;
  submitLabel?: string;
}

interface FormState {
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  tags: string;
}

function createInitialState(
  initialValue?: PromptTemplateInput | null,
): FormState {
  return {
    name: initialValue?.name ?? '',
    description: initialValue?.description ?? '',
    systemPrompt: initialValue?.systemPrompt ?? '',
    userPrompt: initialValue?.userPrompt ?? '',
    tags: initialValue?.tags.join(', ') ?? '',
  };
}

function isSameFormState(left: FormState, right: FormState) {
  return (
    left.name === right.name &&
    left.description === right.description &&
    left.systemPrompt === right.systemPrompt &&
    left.userPrompt === right.userPrompt &&
    left.tags === right.tags
  );
}

function normalizeTags(value: string) {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function formatRequiredMessage(fields: string[]) {
  if (fields.length === 1) {
    return `${fields[0]} is required.`;
  }

  const lastField = fields[fields.length - 1];
  const leadingFields = fields.slice(0, -1);

  return `${leadingFields.join(', ')} and ${lastField} are required.`;
}

export function PromptTemplateForm({
  externalChangeMessage,
  mode,
  initialValue,
  onDirtyChange,
  onSubmit,
  onCancel,
  submitLabel,
}: PromptTemplateFormProps) {
  const allowNavigationRef = useRef(false);
  const continueEditingButtonRef = useRef<HTMLButtonElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const navigationTriggerRef = useRef<HTMLElement | null>(null);
  const [initialFormState, setInitialFormState] = useState<FormState>(() =>
    createInitialState(initialValue),
  );
  const [formState, setFormState] = useState<FormState>(
    initialFormState,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasExternalUpdate, setHasExternalUpdate] = useState(false);
  const isDirty = Object.entries(formState).some(
    ([field, value]) =>
      value !== initialFormState[field as keyof FormState],
  );
  const nextInitialFormState = createInitialState(initialValue);

  if (!isSameFormState(initialFormState, nextInitialFormState)) {
    setInitialFormState(nextInitialFormState);
    setErrorMessage(null);
    setHasExternalUpdate(mode === 'edit' && isDirty);

    if (!isDirty) {
      setFormState(nextInitialFormState);
    }
  }

  const navigationBlocker = useBlocker(
    () => isDirty && !allowNavigationRef.current,
  );

  useEffect(() => {
    if (navigationBlocker.state === 'blocked') {
      const activeElement = document.activeElement;

      navigationTriggerRef.current =
        activeElement instanceof HTMLElement && activeElement !== document.body
          ? activeElement
          : null;
      continueEditingButtonRef.current?.focus();
    }
  }, [navigationBlocker.state]);

  const continueEditing = () => {
    if (navigationBlocker.state !== 'blocked') {
      return;
    }

    const navigationTrigger = navigationTriggerRef.current;

    navigationBlocker.reset();

    window.requestAnimationFrame(() => {
      if (navigationTrigger?.isConnected) {
        navigationTrigger.focus();
      } else {
        nameInputRef.current?.focus();
      }

      navigationTriggerRef.current = null;
    });
  };

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useBeforeUnload(
    (event) => {
      if (!isDirty || allowNavigationRef.current) {
        return;
      }

      event.preventDefault();
    },
    { capture: true },
  );

  const handleChange =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const value = event.target.value;
      setErrorMessage(null);
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
      tags: normalizeTags(formState.tags),
    };

    const missingFields = [
      payload.name ? null : 'Name',
      payload.description ? null : 'Description',
      payload.systemPrompt ? null : 'system prompt',
      payload.userPrompt ? null : 'user prompt',
    ].filter((field): field is string => field !== null);

    if (missingFields.length > 0) {
      setErrorMessage(formatRequiredMessage(missingFields));
      return;
    }

    setErrorMessage(null);
    allowNavigationRef.current = true;

    try {
      onSubmit(payload);
    } catch {
      allowNavigationRef.current = false;
      setErrorMessage(
        'Failed to save this template. Check that browser storage is available and try again.',
      );
      return;
    }

    queueMicrotask(() => {
      allowNavigationRef.current = false;
    });
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

      {errorMessage ? (
        <p className="status-banner status-banner--error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {(externalChangeMessage || hasExternalUpdate) && isDirty ? (
        <p className="status-banner" role="status">
          {externalChangeMessage ??
            'Saved template changed in another tab. Your local draft is still here; review it before saving.'}
        </p>
      ) : null}

      {navigationBlocker.state === 'blocked' ? (
        <div
          aria-describedby="unsaved-template-changes-description"
          aria-labelledby="unsaved-template-changes-title"
          className="status-banner status-banner--error"
          role="dialog"
        >
          <h2 id="unsaved-template-changes-title">Discard unsaved changes?</h2>
          <p id="unsaved-template-changes-description">
            This template has changes that have not been saved in this browser.
          </p>
          <div className="detail-actions detail-actions--inline">
            <button
              ref={continueEditingButtonRef}
              className="secondary-button"
              type="button"
              onClick={continueEditing}
            >
              Continue editing
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => {
                allowNavigationRef.current = true;
                navigationBlocker.proceed();
              }}
            >
              Discard changes
            </button>
          </div>
        </div>
      ) : null}

      <form className="prompt-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            ref={nameInputRef}
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
            {submitLabel ??
              (mode === 'create' ? 'Create template' : 'Save changes')}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
