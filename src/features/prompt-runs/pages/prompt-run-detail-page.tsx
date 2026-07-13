import { useRef, useState } from 'react';
import {
  Link,
  useBeforeUnload,
  useBlocker,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { buildCodeViewerUrl } from '@/features/code-viewer/lib/code-viewer-utils';
import { PromptRunNotePanel } from '@/features/prompt-run-notes/components/prompt-run-note-panel';
import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { PromptRunInputsPanel } from '@/features/prompt-runs/components/prompt-run-inputs-panel';
import {
  PromptRunPromptsPanel,
  type PromptRunCopyTarget,
} from '@/features/prompt-runs/components/prompt-run-prompts-panel';
import { exportPromptRunAsJson } from '@/features/prompt-runs/lib/prompt-run-export';
import {
  buildPromptRunPlaygroundPath,
  buildPromptRunSourceDiffUrl,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  buildPromptTemplateCreatePath,
  buildPromptTemplateDetailPath,
} from '@/features/prompt-templates/lib/prompt-template-links';
import {
  PromptRunNoteRollbackError,
  usePromptRunWorkflowActions,
} from '@/features/prompt-workflows/hooks/use-prompt-run-workflow-actions';
import { writeClipboardText } from '@/lib/clipboard';

type ActionFeedback = {
  message: string;
  tone: 'success' | 'error';
};

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

export function PromptRunDetailPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const { getRunById } = usePromptRuns();
  const { getNoteByRunId } = usePromptRunNotes();
  const { getTemplateById } = usePromptTemplates();
  const { deleteRunWithRelatedData } = usePromptRunWorkflowActions();
  const allowNavigationRef = useRef(false);
  const [isNoteDirty, setIsNoteDirty] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [exportFeedback, setExportFeedback] = useState<ActionFeedback | null>(
    null,
  );
  const [copyFeedback, setCopyFeedback] = useState<ActionFeedback | null>(
    null,
  );
  const navigationBlocker = useBlocker(
    () => isNoteDirty && !allowNavigationRef.current,
  );

  useBeforeUnload(
    (event) => {
      if (!isNoteDirty || allowNavigationRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    },
    { capture: true },
  );

  const run = runId ? getRunById(runId) : undefined;

  if (!run) {
    return (
      <section className="panel empty-state">
        <h1>Run not found</h1>
        <p>The saved prompt run may have been removed from local storage.</p>
        <Link className="primary-button" to="/runs">
          Back to Run History
        </Link>
      </section>
    );
  }

  const sourceTemplate = getTemplateById(run.templateId);
  const note = getNoteByRunId(run.id);
  const handleDeleteRun = () => {
    setDeleteErrorMessage('');
    allowNavigationRef.current = true;

    try {
      deleteRunWithRelatedData(run.id);
      navigate('/runs');
    } catch (error) {
      allowNavigationRef.current = false;
      setDeleteErrorMessage(
        error instanceof PromptRunNoteRollbackError
          ? error.message
          : 'Failed to delete this prompt snapshot. Check that browser storage is available and try again.',
      );
    }
  };
  const codeViewerUrl = buildCodeViewerUrl({
    left: run.systemPrompt,
    right: run.userPrompt,
    mode: 'compare',
    language: 'markdown',
  });
  const sourceRevision =
    sourceTemplate?.revisions.find(
      (revision) => revision.version === run.templateVersion,
    ) ?? null;
  const promptDiffUrl = buildPromptRunSourceDiffUrl({ run, sourceTemplate });
  const handleExportRun = () => {
    try {
      exportPromptRunAsJson({
        run,
        note,
        sourceTemplateRevision: sourceRevision,
      });
      setExportFeedback({
        message: 'Run exported as JSON.',
        tone: 'success',
      });
    } catch {
      setExportFeedback({
        message: 'Failed to export this run as JSON. Please try again.',
        tone: 'error',
      });
    }
  };
  const handleCopyPrompt = async (
    label: PromptRunCopyTarget,
    value: string,
  ) => {
    const promptLabel =
      label === 'full'
        ? 'Full prompt'
        : `${label === 'system' ? 'System' : 'User'} prompt`;

    try {
      await writeClipboardText(value);
      setCopyFeedback({
        message: `${promptLabel} copied.`,
        tone: 'success',
      });
    } catch {
      setCopyFeedback({
        message: `Failed to copy ${promptLabel.toLowerCase()}.`,
        tone: 'error',
      });
    }
  };

  return (
    <section className="playground-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Saved prompt snapshot</p>
        <h1>{run.templateName}</h1>
        <p className="panel__summary">
          Saved {formatCreatedAt(run.createdAt)} from template v
          {run.templateVersion}.
        </p>

        <div className="detail-actions detail-actions--inline">
          <Link className="ghost-button" to="/runs">
            Back to Run History
          </Link>
          {sourceTemplate && !sourceTemplate.archivedAt ? (
            <Link
              className="primary-button"
              to={buildPromptRunPlaygroundPath({
                runId: run.id,
                templateId: run.templateId,
              })}
            >
              Reopen in Playground
            </Link>
          ) : null}
          {promptDiffUrl ? (
            <Link className="secondary-button" to={promptDiffUrl}>
              Compare with source
            </Link>
          ) : sourceTemplate ? (
            <span className="run-history-note">
              Template v{run.templateVersion} is no longer available in local
              revision history, so source comparison is unavailable.
            </span>
          ) : null}
          {sourceTemplate ? (
            <Link
              className="ghost-button"
              to={buildPromptTemplateDetailPath(run.templateId)}
            >
              View source template
            </Link>
          ) : (
            <span className="run-history-note">
              Source template is no longer available.
            </span>
          )}
          <Link
            className="ghost-button"
            to={buildPromptTemplateCreatePath(run.id)}
          >
            Create template from snapshot
          </Link>
          <Link className="ghost-button" to={codeViewerUrl}>
            Open saved prompts in Code Viewer
          </Link>
        </div>
      </div>

      {navigationBlocker.state === 'blocked' ? (
        <div
          aria-describedby="unsaved-run-note-description"
          aria-labelledby="unsaved-run-note-title"
          className="status-banner status-banner--error"
          role="dialog"
        >
          <h2 id="unsaved-run-note-title">Discard unsaved note changes?</h2>
          <p id="unsaved-run-note-description">
            This note draft has not been saved. You can keep editing or discard
            it and continue to the requested page.
          </p>
          <div className="detail-actions detail-actions--inline">
            <button
              autoFocus
              className="secondary-button"
              type="button"
              onClick={() => navigationBlocker.reset()}
            >
              Continue editing
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => navigationBlocker.proceed()}
            >
              Discard draft
            </button>
          </div>
        </div>
      ) : null}

      <PromptRunPromptsPanel
        copyFeedback={copyFeedback}
        onCopyPrompt={handleCopyPrompt}
        run={run}
      />

      <div className="detail-grid">
        <PromptRunInputsPanel run={run} />

        <PromptRunNotePanel
          runId={run.id}
          onDirtyChange={setIsNoteDirty}
        />
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Local snapshot</p>
            <h2>Snapshot management</h2>
            <p className="panel__summary">
              Export a portable JSON copy or remove this snapshot and its note
              from the current browser.
            </p>
          </div>
        </div>

        {exportFeedback ? (
          <p
            className={`status-banner${
              exportFeedback.tone === 'error' ? ' status-banner--error' : ''
            }`}
            role={exportFeedback.tone === 'error' ? 'alert' : 'status'}
          >
            {exportFeedback.message}
          </p>
        ) : null}

        {deleteErrorMessage ? (
          <p className="status-banner status-banner--error" role="alert">
            {deleteErrorMessage}
          </p>
        ) : null}

        {isConfirmingDelete && isNoteDirty ? (
          <p className="status-banner" role="status">
            The unsaved note draft will also be discarded.
          </p>
        ) : null}

        <div className="detail-actions detail-actions--inline">
          <button
            className="ghost-button"
            type="button"
            onClick={handleExportRun}
          >
            Export run JSON
          </button>
          {isConfirmingDelete ? (
            <>
              <button
                className="danger-button"
                type="button"
                onClick={handleDeleteRun}
              >
                Confirm delete
              </button>
              <button
                autoFocus
                className="ghost-button"
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  setDeleteErrorMessage('');
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="danger-button"
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
            >
              Delete run
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
