import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

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

function formatCount(count: number, singularLabel: string) {
  return `${count} ${singularLabel}${count === 1 ? '' : 's'}`;
}

function WorkspaceImportCounts({
  summary,
}: {
  summary: WorkspaceBackupImportSummary;
}) {
  return (
    <>
      <p>
        Templates: {summary.templates.created} created,{' '}
        {summary.templates.updated} updated.
      </p>
      <p>
        Runs: {summary.runs.created} created, {summary.runs.updated} updated.
      </p>
      <p>
        Notes: {summary.notes.created} created, {summary.notes.updated} updated.
      </p>
      <p>
        Recent templates: {summary.recentTemplates.imported} imported,{' '}
        {summary.recentTemplates.skipped} skipped.
      </p>
    </>
  );
}

export function WorkspaceBackupPage() {
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
        message: 'Workspace backup exported as JSON.',
        tone: 'success',
      });
    } catch {
      setExportFeedback({
        message: 'Failed to export the workspace backup. Please try again.',
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
      const rawValue = await file.text();
      const preview = previewWorkspaceBackupJson(rawValue);

      setPendingImport({ fileName: file.name, preview, rawValue });
      setImportSummary(null);
      setImportError('');
    } catch (error) {
      setImportSummary(null);
      setImportError(
        error instanceof Error
          ? error.message
          : 'Unable to import the selected workspace backup.',
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
        error instanceof Error
          ? error.message
          : 'Unable to import the selected workspace backup.',
      );
      setPendingImport(null);
    }
  };

  return (
    <section className="home-layout">
      <section className="panel">
        <p className="eyebrow">Local-first maintenance</p>
        <h1>Workspace backup</h1>
        <p className="panel__summary">
          Export the current local workspace as JSON, or import a previous
          workspace backup into this browser profile.
        </p>

        <div className="detail-actions detail-actions--inline">
          <button
            className="primary-button"
            type="button"
            onClick={handleExportWorkspace}
          >
            Export workspace JSON
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
          <p className="eyebrow">Included data</p>
          <h2>The export includes data already stored locally by the app.</h2>
        </div>

        <div className="workflow-grid">
          <article className="metric-card">
            <span className="metric-card__label">Prompt templates</span>
            <strong>{formatCount(templates.length, 'prompt template')}</strong>
            <p>Template metadata, current prompt text, tags, and revisions.</p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Saved runs</span>
            <strong>{formatCount(runs.length, 'saved run')}</strong>
            <p>
              Prompt snapshots with source template references and captured
              variables.
            </p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Run notes</span>
            <strong>{formatCount(exportableNotes.length, 'run note')}</strong>
            <p>
              {skippedNoteCount > 0
                ? `${formatCount(skippedNoteCount, 'unattached note')} excluded because no matching saved run exists.`
                : 'Notes attached to saved prompt runs for later review.'}
            </p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Recent templates</span>
            <strong>
              {formatCount(currentRecentTemplateIds.length, 'recent template')}
            </strong>
            <p>Playground shortcuts for templates used most recently.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Restore</p>
        <h2>Import a workspace backup</h2>
        <p className="panel__summary">
          Select a JSON backup exported by dev-ai-toolkit. Imported records are
          merged by id, so matching records are updated and new records are added.
        </p>

        <div className="detail-actions detail-actions--inline">
          <label className="ghost-button" htmlFor="workspace-backup-import">
            Import workspace JSON
          </label>
          <input
            className="sr-only"
            id="workspace-backup-import"
            type="file"
            accept="application/json,.json"
            aria-label="Import workspace JSON"
            onChange={handleImportWorkspace}
          />
        </div>

        {importSummary ? (
          <div className="empty-state empty-state--compact" role="status">
            <h2>Workspace backup imported.</h2>
            <WorkspaceImportCounts summary={importSummary} />
          </div>
        ) : null}

        {importError ? (
          <div className="empty-state empty-state--compact" role="alert">
            <h2>Import failed</h2>
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
              Import this workspace backup?
            </h2>
            <p id="workspace-import-preview-description">
              Review the changes from {pendingImport.fileName}. Matching local
              records will be updated after you confirm.
              {pendingImport.preview.includesRecentTemplates
                ? ' The recent-template shortcut list will also be replaced.'
                : ' Existing recent-template shortcuts will be kept.'}
            </p>
            <WorkspaceImportCounts summary={pendingImport.preview.summary} />
            <div className="detail-actions detail-actions--inline">
              <button
                autoFocus
                className="secondary-button"
                type="button"
                onClick={() => setPendingImport(null)}
              >
                Keep current workspace
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={confirmImportWorkspace}
              >
                Import backup
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  );
}
