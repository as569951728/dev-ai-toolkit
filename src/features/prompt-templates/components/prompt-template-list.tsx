import { PromptTemplateEmptyState } from '@/features/prompt-templates/components/prompt-template-empty-state';
import { PromptTemplateFilters } from '@/features/prompt-templates/components/prompt-template-filters';
import type { PromptTemplate } from '@/types/prompt-template';
import type { PromptTemplateFilters as PromptTemplateFiltersValue } from '@/types/prompt-template';

import { PromptTemplateCard } from './prompt-template-card';

interface PromptTemplateListProps {
  templates: PromptTemplate[];
  tags: string[];
  filters: PromptTemplateFiltersValue;
  statusMessage: string | null;
  statusTone: 'success' | 'error';
  archivedCount: number;
  showArchived: boolean;
  onCreate: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onOpenInPlayground: (id: string) => void;
  onOpenRunHistory: (id: string) => void;
  onFiltersChange: (nextFilters: PromptTemplateFiltersValue) => void;
  onToggleArchived: () => void;
  onClearFilters: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function PromptTemplateList({
  templates,
  tags,
  filters,
  statusMessage,
  statusTone,
  archivedCount,
  showArchived,
  onCreate,
  onView,
  onEdit,
  onOpenInPlayground,
  onOpenRunHistory,
  onFiltersChange,
  onToggleArchived,
  onClearFilters,
  onExport,
  onImport,
}: PromptTemplateListProps) {
  const normalizedSearchValue = filters.search.trim();
  const hasActiveFilters =
    normalizedSearchValue.length > 0 || filters.tag !== 'all' || showArchived;

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Prompt Templates</p>
          <h1>Manage reusable AI prompts</h1>
          <p className="panel__summary">
            Keep reusable prompt templates in local storage, then open them in
            the playground or review their saved run history.
          </p>
        </div>

        <div className="panel__actions">
          <button className="ghost-button" type="button" onClick={onImport}>
            Import JSON
          </button>
          <button className="secondary-button" type="button" onClick={onExport}>
            Export JSON
          </button>
          <button className="primary-button" type="button" onClick={onCreate}>
            New template
          </button>
        </div>
      </div>

      {statusMessage ? (
        <p
          className={
            statusTone === 'error'
              ? 'status-banner status-banner--error'
              : 'status-banner'
          }
          role={statusTone === 'error' ? 'alert' : 'status'}
        >
          {statusMessage}
        </p>
      ) : null}

      <PromptTemplateFilters
        filters={filters}
        tags={tags}
        onFiltersChange={onFiltersChange}
      />

      {archivedCount > 0 ? (
        <div className="list-toolbar">
          <button
            className="ghost-button"
            type="button"
            onClick={onToggleArchived}
          >
            {showArchived
              ? 'Hide archived templates'
              : `Show archived templates (${archivedCount})`}
          </button>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="template-filter-list">
          {normalizedSearchValue ? (
            <span className="template-filter-chip">
              Search: {normalizedSearchValue}
            </span>
          ) : null}
          {filters.tag !== 'all' ? (
            <span className="template-filter-chip">Tag: {filters.tag}</span>
          ) : null}
          {showArchived ? (
            <span className="template-filter-chip">Archived: visible</span>
          ) : null}
        </div>
      ) : null}

      {templates.length > 0 ? (
        <div className="prompt-list">
          {templates.map((template) => (
            <PromptTemplateCard
              key={template.id}
              template={template}
              onView={onView}
              onEdit={onEdit}
              onOpenInPlayground={onOpenInPlayground}
              onOpenRunHistory={onOpenRunHistory}
            />
          ))}
        </div>
      ) : (
        <PromptTemplateEmptyState
          onCreate={onCreate}
          onClearFilters={hasActiveFilters ? onClearFilters : undefined}
        />
      )}
    </section>
  );
}
