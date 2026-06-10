import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { useWorkspaceBackup } from '@/features/workspace-backup/hooks/use-workspace-backup';
import { downloadWorkspaceBackup } from '@/features/workspace-backup/lib/workspace-backup-download';
import type { WorkspaceBackupImportSummary } from '@/features/workspace-backup/lib/workspace-backup-merge';

function formatCount(count: number, singularLabel: string) {
  return `${count} ${singularLabel}${count === 1 ? '' : 's'}`;
}

export function WorkspaceBackupPage() {
  const { notes } = usePromptRunNotes();
  const { runs } = usePromptRuns();
  const { templates } = usePromptTemplates();
  const { importWorkspaceBackupJson } = useWorkspaceBackup();
  const [importError, setImportError] = useState('');
  const [importSummary, setImportSummary] =
    useState<WorkspaceBackupImportSummary | null>(null);

  const handleExportWorkspace = () => {
    downloadWorkspaceBackup({
      templates,
      runs,
      notes,
    });
  };

  const handleImportWorkspace = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const summary = importWorkspaceBackupJson(await file.text());
      setImportSummary(summary);
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
            <p>Saved prompt outputs with template references and captured variables.</p>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Run notes</span>
            <strong>{formatCount(notes.length, 'run note')}</strong>
            <p>Notes attached to saved prompt runs for later review.</p>
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
            <p>
              Templates: {importSummary.templates.created} created,{' '}
              {importSummary.templates.updated} updated.
            </p>
            <p>
              Runs: {importSummary.runs.created} created,{' '}
              {importSummary.runs.updated} updated.
            </p>
            <p>
              Notes: {importSummary.notes.created} created,{' '}
              {importSummary.notes.updated} updated.
            </p>
          </div>
        ) : null}

        {importError ? (
          <div className="empty-state empty-state--compact" role="alert">
            <h2>Import failed</h2>
            <p>{importError}</p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
