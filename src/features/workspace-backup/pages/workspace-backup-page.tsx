import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { downloadWorkspaceBackup } from '@/features/workspace-backup/lib/workspace-backup-download';

function formatCount(count: number, singularLabel: string) {
  return `${count} ${singularLabel}${count === 1 ? '' : 's'}`;
}

export function WorkspaceBackupPage() {
  const { notes } = usePromptRunNotes();
  const { runs } = usePromptRuns();
  const { templates } = usePromptTemplates();

  const handleExportWorkspace = () => {
    downloadWorkspaceBackup({
      templates,
      runs,
      notes,
    });
  };

  return (
    <section className="home-layout">
      <section className="panel">
        <p className="eyebrow">Local-first maintenance</p>
        <h1>Workspace backup</h1>
        <p className="panel__summary">
          Export the current local workspace as JSON so it can be saved outside
          this browser profile. Import support is planned, but not available yet.
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
        <p className="eyebrow">Known limitation</p>
        <h2>Import is not wired yet</h2>
        <p className="panel__summary">
          The exported JSON is versioned and ready for a future import flow.
          For now, use it as a manual backup before clearing browser storage or
          moving to another machine.
        </p>
      </section>
    </section>
  );
}
