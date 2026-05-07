import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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
  const { getTemplateById } = usePromptTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    searchParams.get('templateId') ?? 'all',
  );
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
  const hasActiveFilters =
    selectedTemplateId !== 'all' || searchValue.trim().length > 0;

  const availableTemplates = useMemo(
    () =>
      [...new Set(runs.map((run) => `${run.templateId}:::${run.templateName}`))].map(
        (value) => {
          const [id, name] = value.split(':::');
          return { id, name };
        },
      ),
    [runs],
  );

  const selectedTemplateName =
    selectedTemplateId === 'all'
      ? null
      : availableTemplates.find((template) => template.id === selectedTemplateId)
          ?.name ?? null;

  const filteredRuns = useMemo(() => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    return runs.filter((run) => {
      const matchesTemplate =
        selectedTemplateId === 'all' || run.templateId === selectedTemplateId;
      const matchesSearch =
        !normalizedSearchValue ||
        run.templateName.toLowerCase().includes(normalizedSearchValue);

      return matchesTemplate && matchesSearch;
    });
  }, [runs, searchValue, selectedTemplateId]);

  useEffect(() => {
    const nextSearchParams = new URLSearchParams();

    if (selectedTemplateId !== 'all') {
      nextSearchParams.set('templateId', selectedTemplateId);
    }

    const normalizedSearchValue = searchValue.trim();

    if (normalizedSearchValue) {
      nextSearchParams.set('q', normalizedSearchValue);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [searchValue, selectedTemplateId, setSearchParams]);

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
                  placeholder="Search by template name"
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </label>

              <label className="toolbar__filter">
                <span>Template</span>
                <select
                  value={selectedTemplateId}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
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
                  onClick={() => {
                    setSearchValue('');
                    setSelectedTemplateId('all');
                  }}
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

            {filteredRuns.length > 0 ? (
              <div className="revision-list">
                {filteredRuns.map((run) => {
                  const sourceTemplate = getTemplateById(run.templateId);
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

                      <div className="detail-actions detail-actions--inline">
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
