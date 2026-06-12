import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { buildCodeViewerUrl } from '@/features/code-viewer/lib/code-viewer-utils';
import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import {
  formatCapturedVariableCount,
  getCapturedVariablePreview,
} from '@/features/prompt-runs/lib/prompt-run-display';
import { parsePromptRunExportImport } from '@/features/prompt-runs/lib/prompt-run-export';
import { buildPromptRunSourceDiffUrl } from '@/features/prompt-runs/lib/prompt-run-links';
import { matchesPromptRunSearch } from '@/features/prompt-runs/lib/prompt-run-search';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

type ImportStatus = {
  message: string;
  runId: string;
};

export function PromptRunHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { importRuns, runs } = usePromptRuns();
  const { getNoteByRunId, importNotes } = usePromptRunNotes();
  const { getTemplateById } = usePromptTemplates();
  const [importError, setImportError] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const selectedTemplateId = searchParams.get('templateId') ?? 'all';
  const searchValue = searchParams.get('q') ?? '';
  const hasActiveFilters =
    selectedTemplateId !== 'all' || searchValue.trim().length > 0;

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
  const normalizedSearchValue = searchValue.trim();

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
      nextSearchParams.set('q', normalizedNextSearchValue);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleImportRun = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const payload = parsePromptRunExportImport(await file.text());
      importRuns([payload.run]);

      if (payload.note) {
        importNotes([payload.note]);
      }

      setImportStatus({
        message: `Imported ${payload.run.templateName} from ${file.name}.`,
        runId: payload.run.id,
      });
      setImportError('');
    } catch (error) {
      setImportStatus(null);
      setImportError(
        error instanceof Error
          ? error.message
          : 'Unable to import the selected prompt run JSON.',
      );
    } finally {
      event.target.value = '';
    }
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
        <h1>Review saved prompt output as reusable local activity history.</h1>
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
            <h2>Prompt run imported.</h2>
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
            <div className="toolbar">
              <label className="toolbar__search">
                <span>Search runs</span>
                <input
                  type="search"
                  value={searchValue}
                  placeholder="Search by template, prompt text, variable, or note"
                  onChange={(event) =>
                    updateFilters({ nextSearchValue: event.target.value })
                  }
                />
              </label>

              <label className="toolbar__filter">
                <span>Template</span>
                <select
                  value={selectedTemplateId}
                  onChange={(event) =>
                    updateFilters({ nextTemplateId: event.target.value })
                  }
                >
                  <option value="all">All templates</option>
                  {availableTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveFilters ? (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    setSearchParams(new URLSearchParams(), { replace: true })
                  }
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <p className="panel__summary">
              {selectedTemplateName
                ? `Showing ${filteredRuns.length} of ${runs.length} saved runs for ${selectedTemplateName}.`
                : `Showing ${filteredRuns.length} of ${runs.length} saved runs.`}
            </p>

            {hasActiveFilters ? (
              <div className="run-history-filter-list">
                {selectedTemplateName ? (
                  <span className="run-history-filter-chip">
                    Template: {selectedTemplateName}
                  </span>
                ) : null}
                {normalizedSearchValue ? (
                  <span className="run-history-filter-chip">
                    Search: {normalizedSearchValue}
                  </span>
                ) : null}
              </div>
            ) : null}

            {filteredRuns.length > 0 ? (
              <div className="revision-list">
                {filteredRuns.map((run) => {
                  const sourceTemplate = getTemplateById(run.templateId);
                  const note = getNoteByRunId(run.id);
                  const variableCount = Object.keys(run.variables).length;
                  const variablePreview = getCapturedVariablePreview(run.variables);
                  const promptDiffUrl = buildPromptRunSourceDiffUrl({
                    run,
                    sourceTemplate,
                  });

                  return (
                    <article className="revision-card" key={run.id}>
                      <div className="revision-card__header">
                        <div>
                          <h3>{run.templateName}</h3>
                          <p>{formatCreatedAt(run.createdAt)}</p>
                        </div>

                        <span className="revision-badge">
                          Template v{run.templateVersion}
                        </span>
                      </div>

                      <p className="revision-card__description">
                        {formatCapturedVariableCount(variableCount)}
                      </p>

                      {variablePreview.entries.length > 0 ? (
                        <div
                          aria-label="Captured variables"
                          className="run-history-filter-list"
                        >
                          {variablePreview.entries.map(([name, value]) => (
                            <span className="run-history-filter-chip" key={name}>
                              {name}: {value}
                            </span>
                          ))}
                          {variablePreview.remainingCount > 0 ? (
                            <span className="run-history-filter-chip">
                              +{variablePreview.remainingCount} more{' '}
                              {variablePreview.remainingCount === 1
                                ? 'variable'
                                : 'variables'}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {note ? (
                        <div className="run-history-note-summary">
                          <span className="run-history-filter-chip">
                            Note attached
                          </span>
                          <p>{note.body}</p>
                        </div>
                      ) : null}

                      <div className="detail-actions detail-actions--inline">
                        <Link
                          className="ghost-button"
                          to={`/runs/${run.id}`}
                        >
                          View details
                        </Link>
                        {sourceTemplate ? (
                          <Link
                            className="ghost-button"
                            to={`/prompts/${run.templateId}`}
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
                          to={buildCodeViewerUrl({
                            left: run.systemPrompt,
                            right: run.userPrompt,
                            mode: 'compare',
                            language: 'markdown',
                          })}
                        >
                          Open output in Code Viewer
                        </Link>
                        {promptDiffUrl ? (
                          <Link className="ghost-button" to={promptDiffUrl}>
                            Compare with source
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state empty-state--compact">
                <h2>No runs match the current filters</h2>
                <p>Try a different search value or switch back to all templates.</p>
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
            <Link className="primary-button" to="/playground">
              Open Prompt Playground
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
