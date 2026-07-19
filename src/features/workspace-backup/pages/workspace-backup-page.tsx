import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  loadRecentTemplateIds,
  RECENT_TEMPLATE_STORAGE_KEY,
} from '@/features/prompt-playground/repositories/local-storage-recent-template-repository';
import {
  type WorkspaceBackupImportPreview,
  useWorkspaceBackup,
} from '@/features/workspace-backup/hooks/use-workspace-backup';
import { downloadWorkspaceBackup } from '@/features/workspace-backup/lib/workspace-backup-download';
import type { WorkspaceBackupImportSummary } from '@/features/workspace-backup/lib/workspace-backup-merge';
import { filterNotesForWorkspaceBackup } from '@/features/workspace-backup/lib/workspace-backup-transfer';
import { readJsonImportFile } from '@/lib/json-import-file';
import { subscribeToStorageKey } from '@/lib/storage-sync';

type ExportFeedback = {
  message: string;
  tone: 'success' | 'error';
};

interface PendingWorkspaceImport {
  fileName: string;
  preview: WorkspaceBackupImportPreview;
  rawValue: string;
}

function WorkspaceImportCounts({
  summary,
}: {
  summary: WorkspaceBackupImportSummary;
}) {
  const { t } = useLocalization();

  return (
    <>
      <p>
        {t('workspace.summary.templates', {
          created: summary.templates.created,
          updated: summary.templates.updated,
        })}
      </p>
      <p>
        {t('workspace.summary.runs', {
          created: summary.runs.created,
          updated: summary.runs.updated,
        })}
      </p>
      <p>
        {t('workspace.summary.notes', {
          created: summary.notes.created,
          updated: summary.notes.updated,
        })}
      </p>
      <p>
        {t('workspace.summary.recent', {
          imported: summary.recentTemplates.imported,
          skipped: summary.recentTemplates.skipped,
        })}
      </p>
    </>
  );
}

export function WorkspaceBackupPage() {
  const { language, t } = useLocalization();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { notes } = usePromptRunNotes();
  const { runs } = usePromptRuns();
  const { templates } = usePromptTemplates();
  const { importWorkspaceBackupJson, previewWorkspaceBackupJson } =
    useWorkspaceBackup();
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback | null>(
    null,
  );
  const [importError, setImportError] = useState('');
  const [recentTemplateIds, setRecentTemplateIds] = useState(() =>
    loadRecentTemplateIds(),
  );
  const [importSummary, setImportSummary] =
    useState<WorkspaceBackupImportSummary | null>(null);
  const [pendingImport, setPendingImport] =
    useState<PendingWorkspaceImport | null>(null);

  useEffect(
    () =>
      subscribeToStorageKey(RECENT_TEMPLATE_STORAGE_KEY, () => {
        setRecentTemplateIds(loadRecentTemplateIds());
      }),
    [],
  );

  const currentRecentTemplateIds = recentTemplateIds.filter((templateId) =>
    templates.some((template) => template.id === templateId),
  );
  const exportableNotes = filterNotesForWorkspaceBackup(notes, runs);
  const skippedNoteCount = notes.length - exportableNotes.length;

  const handleExportWorkspace = () => {
    try {
      downloadWorkspaceBackup({
        templates,
        runs,
        notes: exportableNotes,
        recentTemplateIds: currentRecentTemplateIds,
      });
      setExportFeedback({
        message: t('workspace.export.success'),
        tone: 'success',
      });
    } catch {
      setExportFeedback({
        message: t('workspace.export.error'),
        tone: 'error',
      });
    }
  };

  const handleImportWorkspace = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPendingImport(null);

    try {
      const rawValue = await readJsonImportFile(file);
      const preview = previewWorkspaceBackupJson(rawValue);

      setPendingImport({ fileName: file.name, preview, rawValue });
      setImportSummary(null);
      setImportError('');
    } catch (error) {
      setImportSummary(null);
      setImportError(
        language === 'en' && error instanceof Error
          ? error.message
          : t('workspace.restore.error'),
      );
    } finally {
      event.target.value = '';
    }
  };

  const confirmImportWorkspace = () => {
    if (!pendingImport) {
      return;
    }

    try {
      const summary = importWorkspaceBackupJson(pendingImport.rawValue);

      setImportSummary(summary);
      setRecentTemplateIds(loadRecentTemplateIds());
      setImportError('');
      setPendingImport(null);
    } catch (error) {
      setImportSummary(null);
      setImportError(
        language === 'en' && error instanceof Error
          ? error.message
          : t('workspace.restore.error'),
      );
      setPendingImport(null);
    }
  };

  return (
    <section className="home-layout">
      <section className="panel">
        <p className="eyebrow">{t('workspace.hero.eyebrow')}</p>
        <h1>{t('workspace.hero.title')}</h1>
        <p className="panel__summary">{t('workspace.hero.summary')}</p>

        <div className="detail-actions detail-actions--inline">
          <button
            className="primary-button"
            type="button"
            onClick={handleExportWorkspace}
          >
            {t('workspace.export.action')}
          </button>
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
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">{t('workspace.data.eyebrow')}</p>
          <h2>{t('workspace.data.title')}</h2>
        </div>

        <div className="workflow-grid workspace-metrics">
          <article className="metric-card">
            <span className="metric-card__label">
              {t('workspace.data.templates')}
            </span>
            <strong>
              {t(
                templates.length === 1
                  ? 'workspace.data.templatesCount.one'
                  : 'workspace.data.templatesCount.other',
                { count: templates.length },
              )}
            </strong>
            <p>{t('workspace.data.templatesDescription')}</p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">{t('workspace.data.runs')}</span>
            <strong>
              {t(
                runs.length === 1
                  ? 'workspace.data.runsCount.one'
                  : 'workspace.data.runsCount.other',
                { count: runs.length },
              )}
            </strong>
            <p>{t('workspace.data.runsDescription')}</p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">{t('workspace.data.notes')}</span>
            <strong>
              {t(
                exportableNotes.length === 1
                  ? 'workspace.data.notesCount.one'
                  : 'workspace.data.notesCount.other',
                { count: exportableNotes.length },
              )}
            </strong>
            <p>
              {skippedNoteCount > 0
                ? t(
                    skippedNoteCount === 1
                      ? 'workspace.data.skippedNotes.one'
                      : 'workspace.data.skippedNotes.other',
                    { count: skippedNoteCount },
                  )
                : t('workspace.data.notesDescription')}
            </p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">
              {t('workspace.data.recent')}
            </span>
            <strong>
              {t(
                currentRecentTemplateIds.length === 1
                  ? 'workspace.data.recentCount.one'
                  : 'workspace.data.recentCount.other',
                { count: currentRecentTemplateIds.length },
              )}
            </strong>
            <p>{t('workspace.data.recentDescription')}</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">{t('workspace.restore.eyebrow')}</p>
        <h2>{t('workspace.restore.title')}</h2>
        <p className="panel__summary">{t('workspace.restore.summary')}</p>

        <div className="detail-actions detail-actions--inline">
          <button
            className="ghost-button"
            type="button"
            onClick={() => importInputRef.current?.click()}
          >
            {t('workspace.restore.action')}
          </button>
          <input
            ref={importInputRef}
            hidden
            id="workspace-backup-import"
            type="file"
            accept="application/json,.json"
            aria-label={t('workspace.restore.action')}
            onChange={handleImportWorkspace}
          />
        </div>

        {importSummary ? (
          <div className="empty-state empty-state--compact" role="status">
            <h2>{t('workspace.restore.success')}</h2>
            <WorkspaceImportCounts summary={importSummary} />
          </div>
        ) : null}

        {importError ? (
          <div className="empty-state empty-state--compact" role="alert">
            <h2>{t('workspace.restore.errorTitle')}</h2>
            <p>{importError}</p>
          </div>
        ) : null}

        {pendingImport ? (
          <div
            aria-describedby="workspace-import-preview-description"
            aria-labelledby="workspace-import-preview-title"
            className="status-banner status-banner--error"
            role="dialog"
          >
            <h2 id="workspace-import-preview-title">
              {t('workspace.restore.dialogTitle')}
            </h2>
            <p id="workspace-import-preview-description">
              {t(
                pendingImport.preview.includesRecentTemplates
                  ? 'workspace.restore.dialogRecent'
                  : 'workspace.restore.dialogKeepRecent',
                { file: pendingImport.fileName },
              )}
            </p>
            <WorkspaceImportCounts summary={pendingImport.preview.summary} />
            <div className="detail-actions detail-actions--inline">
              <button
                autoFocus
                className="secondary-button"
                type="button"
                onClick={() => setPendingImport(null)}
              >
                {t('workspace.restore.keep')}
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={confirmImportWorkspace}
              >
                {t('workspace.restore.confirm')}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  );
}
