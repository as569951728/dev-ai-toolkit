import { useRef, useState } from 'react';
import {
  Link,
  useBeforeUnload,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { PromptRunNotePanel } from '@/features/prompt-run-notes/components/prompt-run-note-panel';
import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { useLocalization } from '@/features/localization/localization-context';
import { PromptRunInputsPanel } from '@/features/prompt-runs/components/prompt-run-inputs-panel';
import { PromptRunOverviewPanel } from '@/features/prompt-runs/components/prompt-run-overview-panel';
import {
  PromptRunPromptsPanel,
  type PromptRunCopyTarget,
} from '@/features/prompt-runs/components/prompt-run-prompts-panel';
import {
  type PromptRunActionFeedback,
  PromptRunSnapshotManagement,
} from '@/features/prompt-runs/components/prompt-run-snapshot-management';
import { exportPromptRunAsJson } from '@/features/prompt-runs/lib/prompt-run-export';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import {
  buildPromptRunDetailPath,
  createPromptRunDetailNavigationState,
  getPromptRunHistoryReturnPath,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  PromptRunNoteRollbackError,
  PromptRunRestoreRollbackError,
  usePromptRunWorkflowActions,
} from '@/features/prompt-workflows/hooks/use-prompt-run-workflow-actions';
import { writeClipboardText } from '@/lib/clipboard';

export function PromptRunDetailPage() {
  const { language, t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const { runId } = useParams();
  const { getRunById } = usePromptRuns();
  const { getNoteByRunId } = usePromptRunNotes();
  const { getTemplateById } = usePromptTemplates();
  const { deleteRunWithRelatedData, restoreRunWithNoteDraft } =
    usePromptRunWorkflowActions();
  const currentRun = runId ? getRunById(runId) : undefined;
  const historyPath = getPromptRunHistoryReturnPath(location.state);
  const allowNavigationRef = useRef(false);
  const [lastRun, setLastRun] = useState(currentRun);
  const [isNoteDirty, setIsNoteDirty] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [restoreErrorMessage, setRestoreErrorMessage] = useState('');
  const [exportFeedback, setExportFeedback] =
    useState<PromptRunActionFeedback | null>(null);
  const [copyFeedback, setCopyFeedback] =
    useState<PromptRunActionFeedback | null>(null);
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

  if (currentRun && currentRun !== lastRun) {
    setLastRun(currentRun);
  }

  const sourceWasDeleted = !currentRun && isNoteDirty;
  const run = currentRun ?? (sourceWasDeleted ? lastRun : undefined);

  if (!run) {
    return (
      <section className="panel empty-state">
        <h1>{t('run.notFound.title')}</h1>
        <p>{t('run.notFound.description')}</p>
        <Link className="primary-button" to={historyPath}>
          {t('run.back')}
        </Link>
      </section>
    );
  }

  const sourceTemplate = getTemplateById(run.templateId);
  const note = getNoteByRunId(run.id);
  const handleRestoreRun = () => {
    setRestoreErrorMessage('');

    try {
      const restoredRun = restoreRunWithNoteDraft(run, noteDraft);

      allowNavigationRef.current = true;
      navigate(buildPromptRunDetailPath(restoredRun.id), {
        replace: true,
        state: createPromptRunDetailNavigationState(historyPath),
      });
      queueMicrotask(() => {
        allowNavigationRef.current = false;
      });
    } catch (error) {
      setRestoreErrorMessage(
        language === 'en' && error instanceof PromptRunRestoreRollbackError
          ? error.message
          : t('run.restore.error'),
      );
    }
  };
  const handleDeleteRun = () => {
    setDeleteErrorMessage('');
    allowNavigationRef.current = true;

    try {
      deleteRunWithRelatedData(run.id);
      navigate(historyPath);
    } catch (error) {
      allowNavigationRef.current = false;
      setDeleteErrorMessage(
        language === 'en' && error instanceof PromptRunNoteRollbackError
          ? error.message
          : t('run.delete.error'),
      );
    }
  };
  const sourceRevision =
    sourceTemplate?.revisions.find(
      (revision) => revision.version === run.templateVersion,
    ) ?? null;
  const handleExportRun = () => {
    try {
      exportPromptRunAsJson({
        run,
        note,
        sourceTemplateRevision: sourceRevision,
      });
      setExportFeedback({
        message: t('run.export.success'),
        tone: 'success',
      });
    } catch {
      setExportFeedback({
        message: t('run.export.error'),
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
        ? t('run.copy.fullLabel')
        : t(
            label === 'system'
              ? 'run.copy.systemLabel'
              : 'run.copy.userLabel',
          );

    try {
      await writeClipboardText(value);
      setCopyFeedback({
        message: t('run.copy.success', { label: promptLabel }),
        tone: 'success',
      });
    } catch {
      setCopyFeedback({
        message: t('run.copy.error', {
          label: language === 'en' ? promptLabel.toLowerCase() : promptLabel,
        }),
        tone: 'error',
      });
    }
  };

  return (
    <section className="playground-layout">
      <PromptRunOverviewPanel
        historyPath={historyPath}
        run={run}
        sourceTemplate={sourceTemplate}
      />

      {sourceWasDeleted ? (
        <div className="status-banner" role="status">
          <h2>{t('run.deleted.title')}</h2>
          <p>{t('run.deleted.description')}</p>
          <div className="detail-actions detail-actions--inline">
            <button
              className="primary-button"
              type="button"
              onClick={handleRestoreRun}
            >
              {t('run.deleted.restore')}
            </button>
          </div>
        </div>
      ) : null}

      {restoreErrorMessage ? (
        <p className="status-banner status-banner--error" role="alert">
          {restoreErrorMessage}
        </p>
      ) : null}

      {navigationBlocker.state === 'blocked' ? (
        <div
          aria-describedby="unsaved-run-note-description"
          aria-labelledby="unsaved-run-note-title"
          className="status-banner status-banner--error"
          role="dialog"
        >
          <h2 id="unsaved-run-note-title">{t('run.unsaved.title')}</h2>
          <p id="unsaved-run-note-description">
            {t('run.unsaved.description')}
          </p>
          <div className="detail-actions detail-actions--inline">
            <button
              autoFocus
              className="secondary-button"
              type="button"
              onClick={() => navigationBlocker.reset()}
            >
              {t('run.unsaved.keep')}
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => navigationBlocker.proceed()}
            >
              {t('run.unsaved.discard')}
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
        <PromptRunInputsPanel historyPath={historyPath} run={run} />

        <PromptRunNotePanel
          isSaveDisabled={sourceWasDeleted}
          runId={run.id}
          onDraftChange={setNoteDraft}
          onDirtyChange={setIsNoteDirty}
        />
      </div>

      {!sourceWasDeleted ? (
        <PromptRunSnapshotManagement
          deleteErrorMessage={deleteErrorMessage}
          exportFeedback={exportFeedback}
          isNoteDirty={isNoteDirty}
          onCancelDelete={() => setDeleteErrorMessage('')}
          onConfirmDelete={handleDeleteRun}
          onExport={handleExportRun}
        />
      ) : null}
    </section>
  );
}
