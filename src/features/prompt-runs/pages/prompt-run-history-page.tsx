import { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
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
  const { t } = useLocalization();
  const importInputRef = useRef<HTMLInputElement | null>(null);
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
        <p className="eyebrow">{t('runs.history.eyebrow')}</p>
        <h1>{t('runs.history.title')}</h1>
        <p className="panel__summary">{t('runs.history.summary')}</p>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">{t('runs.section.eyebrow')}</p>
            <h2>{t('runs.section.title')}</h2>
            <p className="panel__summary">{t('runs.section.summary')}</p>
          </div>
          <div className="detail-actions detail-actions--inline">
            <button
              className="ghost-button"
              type="button"
              onClick={() => importInputRef.current?.click()}
            >
              {t('runs.import.action')}
            </button>
            <input
              ref={importInputRef}
              hidden
              id="prompt-run-import"
              type="file"
              accept="application/json,.json"
              aria-label={t('runs.import.action')}
              onChange={handleImportRun}
            />
          </div>
        </div>

        {importStatus ? (
          <div className="empty-state empty-state--compact" role="status">
            <h2>
              {importStatus.replacedExistingRun
                ? t('runs.import.replacedTitle')
                : t('runs.import.importedTitle')}
            </h2>
            <p>
              {importStatus.message}{' '}
              <Link
                state={createPromptRunDetailNavigationState(historyPath)}
                to={buildPromptRunDetailPath(importStatus.runId)}
              >
                {t('runs.import.open')}
              </Link>
            </p>
          </div>
        ) : null}

        {importError ? (
          <div className="empty-state empty-state--compact" role="alert">
            <h2>{t('runs.import.errorTitle')}</h2>
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
              {t('runs.import.conflictTitle')}
            </h2>
            <p id="prompt-run-import-conflict-description">
              {t(
                pendingImport.payload.note
                  ? 'runs.import.conflictWithNote'
                  : 'runs.import.conflictWithoutNote',
              )}
            </p>
            <div className="detail-actions detail-actions--inline">
              <button
                autoFocus
                className="secondary-button"
                type="button"
                onClick={cancelPendingImport}
              >
                {t('runs.import.keep')}
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={confirmPendingImport}
              >
                {t('runs.import.replace')}
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
                <h2>{t('runs.empty.filteredTitle')}</h2>
                <p>{t('runs.empty.filteredDescription')}</p>
                {canCreateFirstRun ? (
                  <Link className="primary-button" to={emptyHistoryPlaygroundUrl}>
                    {t('runs.empty.create')}
                  </Link>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h2>{t('runs.empty.title')}</h2>
            <p>{t('runs.empty.description')}</p>
            <Link className="primary-button" to={emptyHistoryPlaygroundUrl}>
              {canCreateFirstRun
                ? t('runs.empty.create')
                : t('runs.empty.open')}
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
