import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
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

export function PromptRunHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { runs } = usePromptRuns();
  const { getNoteByRunId } = usePromptRunNotes();
  const { getTemplateById } = usePromptTemplates();
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

  const filteredRuns = useMemo(() => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    return runs.filter((run) => {
      const sourceTemplateName = getTemplateById(run.templateId)?.name ?? '';
      const matchesTemplate =
        selectedTemplateId === 'all' || run.templateId === selectedTemplateId;
      const matchesSearch =
        !normalizedSearchValue ||
        run.templateName.toLowerCase().includes(normalizedSearchValue) ||
        sourceTemplateName.toLowerCase().includes(normalizedSearchValue) ||
        (getNoteByRunId(run.id)?.body.toLowerCase().includes(
          normalizedSearchValue,
        ) ??
          false);

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
        </div>

        {runs.length > 0 ? (
          <>
            <div className="toolbar">
              <label className="toolbar__search">
                <span>Search runs</span>
                <input
                  type="search"
                  value={searchValue}
                  placeholder="Search by template or note"
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
                        {variableCount > 0
                          ? `${variableCount} template variables were captured in this run.`
                          : 'No template variables were captured in this run.'}
                      </p>

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
                          to={`/code-viewer?left=${encodeURIComponent(run.systemPrompt)}&right=${encodeURIComponent(run.userPrompt)}&mode=compare&language=markdown`}
                        >
                          Open output in Code Viewer
                        </Link>
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
