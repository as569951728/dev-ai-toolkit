import { useLocalization } from '@/features/localization/localization-context';
import type { PromptRunSortOrder } from '@/features/prompt-runs/lib/prompt-run-history-query';

interface TemplateOption {
  id: string;
  name: string;
}

interface PromptRunHistoryFiltersProps {
  availableTemplates: TemplateOption[];
  filteredRunCount: number;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onSortOrderChange: (sortOrder: PromptRunSortOrder) => void;
  onTemplateChange: (templateId: string) => void;
  searchValue: string;
  selectedTemplateId: string;
  selectedTemplateName: string | null;
  sortOrder: PromptRunSortOrder;
  totalRunCount: number;
}

export function PromptRunHistoryFilters({
  availableTemplates,
  filteredRunCount,
  onClear,
  onSearchChange,
  onSortOrderChange,
  onTemplateChange,
  searchValue,
  selectedTemplateId,
  selectedTemplateName,
  sortOrder,
  totalRunCount,
}: PromptRunHistoryFiltersProps) {
  const { t } = useLocalization();
  const normalizedSearchValue = searchValue.trim();
  const hasActiveFilters =
    selectedTemplateId !== 'all' || normalizedSearchValue.length > 0;

  return (
    <>
      <div className="toolbar">
        <label className="toolbar__search">
          <span>{t('runs.filters.searchLabel')}</span>
          <input
            type="search"
            value={searchValue}
            placeholder={t('runs.filters.searchPlaceholder')}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="toolbar__filter">
          <span>{t('runs.filters.templateLabel')}</span>
          <select
            value={selectedTemplateId}
            onChange={(event) => onTemplateChange(event.target.value)}
          >
            <option value="all">{t('runs.filters.allTemplates')}</option>
            {availableTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <label className="toolbar__filter">
          <span>{t('runs.filters.sortLabel')}</span>
          <select
            value={sortOrder}
            onChange={(event) =>
              onSortOrderChange(event.target.value as PromptRunSortOrder)
            }
          >
            <option value="newest">{t('runs.filters.newest')}</option>
            <option value="oldest">{t('runs.filters.oldest')}</option>
          </select>
        </label>

        {hasActiveFilters ? (
          <button className="ghost-button" type="button" onClick={onClear}>
            {t('runs.filters.clear')}
          </button>
        ) : null}
      </div>

      <p className="panel__summary">
        {selectedTemplateName
          ? t('runs.filters.resultFor', {
              filtered: filteredRunCount,
              name: selectedTemplateName,
              total: totalRunCount,
            })
          : t('runs.filters.result', {
              filtered: filteredRunCount,
              total: totalRunCount,
            })}
      </p>

      {hasActiveFilters ? (
        <div className="run-history-filter-list">
          {selectedTemplateName ? (
            <span className="run-history-filter-chip">
              {t('runs.filters.activeTemplate', { name: selectedTemplateName })}
            </span>
          ) : null}
          {normalizedSearchValue ? (
            <span className="run-history-filter-chip">
              {t('runs.filters.activeSearch', { value: normalizedSearchValue })}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
