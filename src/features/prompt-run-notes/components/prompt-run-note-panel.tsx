import { useEffect, useRef, useState } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';

interface PromptRunNotePanelProps {
  runId: string;
}

interface NoteSaveFeedback {
  message: string;
  tone: 'success' | 'error';
}

export function PromptRunNotePanel({ runId }: PromptRunNotePanelProps) {
  const { getNoteByRunId, saveNote } = usePromptRunNotes();
  const savedNote = getNoteByRunId(runId);
  const [body, setBody] = useState(savedNote?.body ?? '');
  const [saveFeedback, setSaveFeedback] = useState<NoteSaveFeedback | null>(
    null,
  );
  const previousRunId = useRef(runId);

  useEffect(() => {
    if (previousRunId.current !== runId) {
      setBody(savedNote?.body ?? '');
      setSaveFeedback(null);
      previousRunId.current = runId;
    }
  }, [runId, savedNote?.body]);

  const handleSave = () => {
    try {
      const note = saveNote(runId, body);

      setBody(note?.body ?? '');
      setSaveFeedback({
        message: note ? 'Note saved.' : 'Note cleared.',
        tone: 'success',
      });
    } catch {
      setSaveFeedback({
        message:
          'Failed to save this note. Check that browser storage is available and try again.',
        tone: 'error',
      });
    }
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Run notes</p>
          <h2>Maintenance note</h2>
          <p className="panel__summary">
            Keep a short note about why this prompt snapshot was useful or what
            to adjust next time.
          </p>
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

      <label className="field">
        <span>Note</span>
        <textarea
          value={body}
          placeholder="Add a note for this saved run"
          onChange={(event) => {
            setBody(event.target.value);
            setSaveFeedback(null);
          }}
        />
      </label>

      <div className="detail-actions detail-actions--inline">
        <button className="primary-button" type="button" onClick={handleSave}>
          Save note
        </button>
      </div>
    </section>
  );
}
