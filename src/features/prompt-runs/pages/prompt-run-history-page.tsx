import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { PromptRunHistoryCard } from '@/features/prompt-runs/components/prompt-run-history-card';
import { PromptRunHistoryFilters } from '@/features/prompt-runs/components/prompt-run-history-filters';
import { usePromptRunImport } from '@/features/prompt-runs/hooks/use-prompt-run-import';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { matchesPromptRunSearch } from '@/features/prompt-runs/lib/prompt-run-search';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

export function PromptRunHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { deleteRun, getRunById, importRuns, runs } = usePromptRuns();
  const { getNoteByRunId, importNotes } = usePromptRunNotes();
  const { getTemplateById } = usePromptTemplates();
  const { handleImportRun, importError, importStatus } = usePromptRunImport({
    deleteRun,
    getRunById,
    importNotes,
    importRuns,
  });
  const requestedTemplateId = searchParams.get('templateId') ?? 'all';
  const hasRequestedTemplate =
    requestedTemplateId === 'all' ||
    runs.some((run) => run.templateId === requestedTemplateId) ||
    Boolean(getTemplateById(requestedTemplateId));
  const selectedTemplateId = hasRequestedTemplate
    ? requestedTemplateId
    : 'all';
  const searchValue = searchParams.get('q') ?? '';

  const availableTemplates = useMemo(
    () => {
      const templatesById = new Map<string, { id: string; name: string }>();

      for (const run of runs) {
        if (templatesById.has(run.templateId)) {
          continue;
        }

        templatesById.set(run.templateId, {
          id: run.templateId,
          name: getTemplateById(run.templateId)?.name ?? run.templateName,
        });
      }

      if (selectedTemplateId !== 'all' && !templatesById.has(selectedTemplateId)) {
        const selectedTemplate = getTemplateById(selectedTemplateId);

        if (selectedTemplate) {
          templatesById.set(selectedTemplate.id, {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
          });
        }
      }

      return [...templatesById.values()];
    },
    [getTemplateById, runs, selectedTemplateId],
  );

  const selectedTemplateName =
    selectedTemplateId === 'all'
      ? null
      : availableTemplates.find((template) => template.id === selectedTemplateId)
          ?.name ?? null;
  const selectedTemplate =
    selectedTemplateId === 'all'
      ? null
      : (getTemplateById(selectedTemplateId) ?? null);
  const activeSelectedTemplate =
    selectedTemplate && !selectedTemplate.archivedAt ? selectedTemplate : null;
  const selectedTemplateHasRuns = activeSelectedTemplate
    ? runs.some((run) => run.templateId === activeSelectedTemplate.id)
    : false;
  const canCreateFirstRun =
    activeSelectedTemplate !== null && !selectedTemplateHasRuns;
  const emptyHistoryPlaygroundUrl = canCreateFirstRun
    ? `/playground?templateId=${encodeURIComponent(activeSelectedTemplate.id)}`
    : '/playground';

  const updateFilters = ({
    nextSearchValue = searchValue,
    nextTemplateId = selectedTemplateId,
  }: {
    nextSearchValue?: string;
    nextTemplateId?: string;
  }) => {
    const nextSearchParams = new URLSearchParams();
    const normalizedNextSearchValue = nextSearchValue.trim();

    if (nextTemplateId !== 'all') {
      nextSearchParams.set('templateId', nextTemplateId);
    }

    if (normalizedNextSearchValue) {
      nextSearchParams.set('q', nextSearchValue);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const sourceTemplateName = getTemplateById(run.templateId)?.name ?? '';
      const matchesTemplate =
        selectedTemplateId === 'all' || run.templateId === selectedTemplateId;
      const matchesSearch = matchesPromptRunSearch({
        run,
        sourceTemplateName,
        note: getNoteByRunId(run.id) ?? null,
        query: searchValue,
      });

      return matchesTemplate && matchesSearch;
    });
  }, [getNoteByRunId, getTemplateById, runs, searchValue, selectedTemplateId]);

  return (
    <section className="playground-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Prompt Run History</p>
        <h1>Review saved prompt snapshots in a local activity history.</h1>
        <p className="panel__summary">
          Browse saved runs, inspect which template version produced them, and
          jump back to the source template when you want to refine the workflow.
        </p>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Saved runs</p>
            <h2>Recent prompt runs</h2>
            <p className="panel__summary">
              Runs are stored locally and listed with their source template and
              captured variables.
            </p>
          </div>
          <div className="detail-actions detail-actions--inline">
            <label className="ghost-button" htmlFor="prompt-run-import">
              Import run JSON
            </label>
            <input
              className="sr-only"
              id="prompt-run-import"
              type="file"
              accept="application/json,.json"
              aria-label="Import run JSON"
              onChange={handleImportRun}
            />
          </div>
        </div>

        {importStatus ? (
          <div className="empty-state empty-state--compact" role="status">
            <h2>
              {importStatus.replacedExistingRun
                ? 'Prompt run replaced.'
                : 'Prompt run imported.'}
            </h2>
            <p>
              {importStatus.message}{' '}
              <Link to={`/runs/${importStatus.runId}`}>Open imported run</Link>
            </p>
          </div>
        ) : null}

        {importError ? (
          <div className="empty-state empty-state--compact" role="alert">
            <h2>Import failed</h2>
            <p>{importError}</p>
          </div>
        ) : null}

        {runs.length > 0 ? (
          <>
            <PromptRunHistoryFilters
              availableTemplates={availableTemplates}
              filteredRunCount={filteredRuns.length}
              onClear={() =>
                setSearchParams(new URLSearchParams(), { replace: true })
              }
              onSearchChange={(nextSearchValue) =>
                updateFilters({ nextSearchValue })
              }
              onTemplateChange={(nextTemplateId) =>
                updateFilters({ nextTemplateId })
              }
              searchValue={searchValue}
              selectedTemplateId={selectedTemplateId}
              selectedTemplateName={selectedTemplateName}
              totalRunCount={runs.length}
            />

            {filteredRuns.length > 0 ? (
              <div className="revision-list">
                {filteredRuns.map((run) => {
                  const sourceTemplate = getTemplateById(run.templateId);
                  const note = getNoteByRunId(run.id);

                  return (
                    <PromptRunHistoryCard
                      key={run.id}
                      note={note}
                      run={run}
                      sourceTemplate={sourceTemplate}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state empty-state--compact">
                <h2>No runs match the current filters</h2>
                <p>Try a different search value or switch back to all templates.</p>
                {canCreateFirstRun ? (
                  <Link className="primary-button" to={emptyHistoryPlaygroundUrl}>
                    Create first run in Playground
                  </Link>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h2>No saved runs yet</h2>
            <p>
              Save a prompt run from the playground to build a reusable local
              activity trail.
            </p>
            <Link className="primary-button" to={emptyHistoryPlaygroundUrl}>
              {canCreateFirstRun
                ? 'Create first run in Playground'
                : 'Open Prompt Playground'}
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
