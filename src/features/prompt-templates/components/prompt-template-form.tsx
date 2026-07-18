import { useEffect, useRef, useState } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
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

export function PromptTemplateForm({
  externalChangeMessage,
  mode,
  initialValue,
  onDirtyChange,
  onSubmit,
  onCancel,
  submitLabel,
}: PromptTemplateFormProps) {
  const { t } = useLocalization();
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
      payload.name ? null : t('templates.form.name'),
      payload.description ? null : t('templates.form.description'),
      payload.systemPrompt ? null : t('templates.form.systemRequired'),
      payload.userPrompt ? null : t('templates.form.userRequired'),
    ].filter((field): field is string => field !== null);

    if (missingFields.length > 0) {
      const fields =
        missingFields.length === 1
          ? missingFields[0]!
          : t('templates.form.requiredJoin', {
              leading: missingFields.slice(0, -1).join(', '),
              last: missingFields.at(-1)!,
            });

      setErrorMessage(
        t(
          missingFields.length === 1
            ? 'templates.form.required.one'
            : 'templates.form.required.other',
          { fields },
        ),
      );
      return;
    }

    setErrorMessage(null);
    allowNavigationRef.current = true;

    try {
      onSubmit(payload);
    } catch {
      allowNavigationRef.current = false;
      setErrorMessage(
        t('templates.form.saveError'),
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
            {mode === 'create'
              ? t('templates.form.newEyebrow')
              : t('templates.form.editEyebrow')}
          </p>
          <h1>
            {mode === 'create'
              ? t('templates.form.createTitle')
              : initialValue?.name}
          </h1>
          <p className="panel__summary">{t('templates.form.summary')}</p>
        </div>

        <button className="ghost-button" type="button" onClick={onCancel}>
          {t('templates.form.back')}
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
            t('templates.form.externalUpdate')}
        </p>
      ) : null}

      {navigationBlocker.state === 'blocked' ? (
        <div
          aria-describedby="unsaved-template-changes-description"
          aria-labelledby="unsaved-template-changes-title"
          className="status-banner status-banner--error"
          role="dialog"
        >
          <h2 id="unsaved-template-changes-title">
            {t('templates.form.discardTitle')}
          </h2>
          <p id="unsaved-template-changes-description">
            {t('templates.form.discardDescription')}
          </p>
          <div className="detail-actions detail-actions--inline">
            <button
              ref={continueEditingButtonRef}
              className="secondary-button"
              type="button"
              onClick={continueEditing}
            >
              {t('templates.form.continue')}
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => {
                allowNavigationRef.current = true;
                navigationBlocker.proceed();
              }}
            >
              {t('templates.form.discard')}
            </button>
          </div>
        </div>
      ) : null}

      <form className="prompt-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>{t('templates.form.name')}</span>
          <input
            ref={nameInputRef}
            required
            value={formState.name}
            onChange={handleChange('name')}
            placeholder={t('templates.form.namePlaceholder')}
          />
        </label>

        <label className="field">
          <span>{t('templates.form.description')}</span>
          <input
            required
            value={formState.description}
            onChange={handleChange('description')}
            placeholder={t('templates.form.descriptionPlaceholder')}
          />
        </label>

        <label className="field field--full">
          <span>{t('templates.form.system')}</span>
          <textarea
            required
            rows={6}
            value={formState.systemPrompt}
            onChange={handleChange('systemPrompt')}
            placeholder={t('templates.form.systemPlaceholder')}
          />
        </label>

        <label className="field field--full">
          <span>{t('templates.form.user')}</span>
          <textarea
            required
            rows={8}
            value={formState.userPrompt}
            onChange={handleChange('userPrompt')}
            placeholder={t('templates.form.userPlaceholder')}
          />
        </label>

        <label className="field field--full">
          <span>{t('templates.form.tags')}</span>
          <input
            value={formState.tags}
            onChange={handleChange('tags')}
            placeholder={t('templates.form.tagsPlaceholder')}
          />
        </label>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            {submitLabel ??
              (mode === 'create'
                ? t('templates.form.create')
                : t('templates.form.save'))}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            {t('templates.form.cancel')}
          </button>
        </div>
      </form>
    </section>
  );
}
