import { useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { PromptRunHistoryCard } from '@/features/prompt-runs/components/prompt-run-history-card';
import { PromptRunHistoryFilters } from '@/features/prompt-runs/components/prompt-run-history-filters';
import { usePromptRunImport } from '@/features/prompt-runs/hooks/use-prompt-run-import';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import {
  buildPromptRunHistorySearchParams,
  getPromptRunSortOrder,
  normalizePromptRunHistorySearchParams,
  type PromptRunSortOrder,
} from '@/features/prompt-runs/lib/prompt-run-history-query';
import {
  buildPromptRunDetailPath,
  createPromptRunDetailNavigationState,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { matchesPromptRunSearch } from '@/features/prompt-runs/lib/prompt-run-search';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { buildPromptTemplatePlaygroundPath } from '@/features/prompt-templates/lib/prompt-template-links';

export function PromptRunHistoryPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { deleteRun, getRunById, importRuns, runs } = usePromptRuns();
  const { getNoteByRunId, importNotes } = usePromptRunNotes();
  const { getTemplateById } = usePromptTemplates();
  const {
    cancelPendingImport,
    confirmPendingImport,
    handleImportRun,
    importError,
    importStatus,
    pendingImport,
  } = usePromptRunImport({
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
  const sortOrder = getPromptRunSortOrder(searchParams);
  const historyPath = `${location.pathname}${location.search}`;

  useEffect(() => {
    const normalizedSearchParams = normalizePromptRunHistorySearchParams(
      searchParams,
      { hasRequestedTemplate },
    );

    if (!normalizedSearchParams) {
      return;
    }

    setSearchParams(normalizedSearchParams, { replace: true });
  }, [hasRequestedTemplate, searchParams, setSearchParams]);

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
    ? buildPromptTemplatePlaygroundPath(activeSelectedTemplate.id)
    : '/playground';

  const updateFilters = ({
    nextSearchValue = searchValue,
    nextSortOrder = sortOrder,
    nextTemplateId = selectedTemplateId,
  }: {
    nextSearchValue?: string;
    nextSortOrder?: PromptRunSortOrder;
    nextTemplateId?: string;
  }) => {
    setSearchParams(
      buildPromptRunHistorySearchParams({
        searchValue: nextSearchValue,
        sortOrder: nextSortOrder,
        templateId: nextTemplateId,
      }),
      { replace: true },
    );
  };

  const filteredRuns = useMemo(() => {
    const matches = runs.filter((run) => {
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

    return sortOrder === 'oldest' ? [...matches].reverse() : matches;
  }, [
    getNoteByRunId,
    getTemplateById,
    runs,
    searchValue,
    selectedTemplateId,
    sortOrder,
  ]);

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
              <Link
                state={createPromptRunDetailNavigationState(historyPath)}
                to={buildPromptRunDetailPath(importStatus.runId)}
              >
                Open imported run
              </Link>
            </p>
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
            aria-describedby="prompt-run-import-conflict-description"
            aria-labelledby="prompt-run-import-conflict-title"
            className="status-banner status-banner--error"
            role="dialog"
          >
            <h2 id="prompt-run-import-conflict-title">
              Replace this local prompt run?
            </h2>
            <p id="prompt-run-import-conflict-description">
              A local run already uses this ID. Replacing it will overwrite the
              saved prompts and captured variables.
              {pendingImport.payload.note
                ? ' The imported note will replace any local note attached to this run.'
                : ' This file has no note, so any local note will remain attached.'}
            </p>
            <div className="detail-actions detail-actions--inline">
              <button
                autoFocus
                className="secondary-button"
                type="button"
                onClick={cancelPendingImport}
              >
                Keep local run
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={confirmPendingImport}
              >
                Replace local run
              </button>
            </div>
          </div>
        ) : null}

        {runs.length > 0 ? (
          <>
            <PromptRunHistoryFilters
              availableTemplates={availableTemplates}
              filteredRunCount={filteredRuns.length}
              onClear={() =>
                setSearchParams(
                  buildPromptRunHistorySearchParams({
                    searchValue: '',
                    sortOrder,
                    templateId: 'all',
                  }),
                  { replace: true },
                )
              }
              onSearchChange={(nextSearchValue) =>
                updateFilters({ nextSearchValue })
              }
              onSortOrderChange={(nextSortOrder) =>
                updateFilters({ nextSortOrder })
              }
              onTemplateChange={(nextTemplateId) =>
                updateFilters({ nextTemplateId })
              }
              searchValue={searchValue}
              selectedTemplateId={selectedTemplateId}
              selectedTemplateName={selectedTemplateName}
              sortOrder={sortOrder}
              totalRunCount={runs.length}
            />

            {filteredRuns.length > 0 ? (
              <div className="revision-list">
                {filteredRuns.map((run) => {
                  const sourceTemplate = getTemplateById(run.templateId);
                  const note = getNoteByRunId(run.id);

                  return (
                    <PromptRunHistoryCard
                      historyPath={historyPath}
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
