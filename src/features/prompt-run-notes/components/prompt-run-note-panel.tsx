import { useEffect, useRef, useState } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';

interface PromptRunNotePanelProps {
  runId: string;
}

export function PromptRunNotePanel({ runId }: PromptRunNotePanelProps) {
  const { getNoteByRunId, saveNote } = usePromptRunNotes();
  const savedNote = getNoteByRunId(runId);
  const [body, setBody] = useState(savedNote?.body ?? '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const previousRunId = useRef(runId);

  useEffect(() => {
    if (previousRunId.current !== runId) {
      setBody(savedNote?.body ?? '');
      setStatusMessage(null);
      previousRunId.current = runId;
    }
  }, [runId, savedNote?.body]);

  const handleSave = () => {
    saveNote(runId, body.trim());
    setStatusMessage('Note saved.');
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Run notes</p>
          <h2>Maintenance note</h2>
          <p className="panel__summary">
            Keep a short note about why this saved output was useful or what to
            adjust next time.
          </p>
        </div>
      </div>

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}

      <label className="field">
        <span>Note</span>
        <textarea
          value={body}
          placeholder="Add a note for this saved run"
          onChange={(event) => {
            setBody(event.target.value);
            setStatusMessage(null);
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
