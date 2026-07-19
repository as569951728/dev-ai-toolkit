import { useEffect, useRef, useState } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';

interface PromptRunNotePanelProps {
  isSaveDisabled?: boolean;
  onDraftChange?: (body: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  runId: string;
}

interface NoteSaveFeedback {
  message: string;
  tone: 'success' | 'error';
}

export function PromptRunNotePanel({
  isSaveDisabled = false,
  onDraftChange,
  onDirtyChange,
  runId,
}: PromptRunNotePanelProps) {
  const { t } = useLocalization();
  const { getNoteByRunId, saveNote } = usePromptRunNotes();
  const savedNote = getNoteByRunId(runId);
  const savedBody = savedNote?.body ?? '';
  const [body, setBody] = useState(savedBody);
  const [saveFeedback, setSaveFeedback] = useState<NoteSaveFeedback | null>(
    null,
  );
  const [hasExternalUpdate, setHasExternalUpdate] = useState(false);
  const previousRunId = useRef(runId);
  const previousSavedBody = useRef(savedBody);

  useEffect(() => {
    if (previousRunId.current !== runId) {
      setBody(savedBody);
      setSaveFeedback(null);
      setHasExternalUpdate(false);
      previousRunId.current = runId;
    } else if (previousSavedBody.current !== savedBody) {
      if (body === previousSavedBody.current) {
        setBody(savedBody);
        setSaveFeedback(null);
        setHasExternalUpdate(false);
      } else {
        setHasExternalUpdate(true);
      }
    }

    previousSavedBody.current = savedBody;
  }, [body, runId, savedBody]);

  useEffect(() => {
    onDirtyChange?.(body !== savedBody);
    onDraftChange?.(body);
  }, [body, onDirtyChange, onDraftChange, savedBody]);

  const handleSave = () => {
    try {
      const note = saveNote(runId, body);
      const nextSavedBody = note?.body ?? '';

      previousSavedBody.current = nextSavedBody;
      setBody(nextSavedBody);
      setSaveFeedback({
        message: note ? t('run.note.saved') : t('run.note.cleared'),
        tone: 'success',
      });
      setHasExternalUpdate(false);
    } catch {
      setSaveFeedback({
        message: t('run.note.error'),
        tone: 'error',
      });
    }
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{t('run.note.eyebrow')}</p>
          <h2>{t('run.note.title')}</h2>
          <p className="panel__summary">{t('run.note.summary')}</p>
        </div>
      </div>

      {saveFeedback ? (
        <p
          className={
            saveFeedback.tone === 'error'
              ? 'status-banner status-banner--error'
              : 'status-banner'
          }
          role={saveFeedback.tone === 'error' ? 'alert' : 'status'}
        >
          {saveFeedback.message}
        </p>
      ) : null}

      {hasExternalUpdate ? (
        <p className="status-banner" role="status">
          {t('run.note.externalUpdate')}
        </p>
      ) : null}

      <label className="field">
        <span>{t('run.note.label')}</span>
        <textarea
          value={body}
          placeholder={t('run.note.placeholder')}
          onChange={(event) => {
            const nextBody = event.target.value;

            setBody(nextBody);
            setSaveFeedback(null);

            if (nextBody === savedBody) {
              setHasExternalUpdate(false);
            }
          }}
        />
      </label>

      <div className="detail-actions detail-actions--inline">
        <button
          className="primary-button"
          type="button"
          disabled={isSaveDisabled}
          onClick={handleSave}
        >
          {t('run.note.save')}
        </button>
      </div>
    </section>
  );
}
