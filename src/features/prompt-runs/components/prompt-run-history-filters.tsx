interface TemplateOption {
  id: string;
  name: string;
}

interface PromptRunHistoryFiltersProps {
  availableTemplates: TemplateOption[];
  filteredRunCount: number;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onTemplateChange: (templateId: string) => void;
  searchValue: string;
  selectedTemplateId: string;
  selectedTemplateName: string | null;
  totalRunCount: number;
}

export function PromptRunHistoryFilters({
  availableTemplates,
  filteredRunCount,
  onClear,
  onSearchChange,
  onTemplateChange,
  searchValue,
  selectedTemplateId,
  selectedTemplateName,
  totalRunCount,
}: PromptRunHistoryFiltersProps) {
  const normalizedSearchValue = searchValue.trim();
  const hasActiveFilters =
    selectedTemplateId !== 'all' || normalizedSearchValue.length > 0;

  return (
    <>
      <div className="toolbar">
        <label className="toolbar__search">
          <span>Search runs</span>
          <input
            type="search"
            value={searchValue}
            placeholder="Search by template, prompt text, variable, or note"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="toolbar__filter">
          <span>Template</span>
          <select
            value={selectedTemplateId}
            onChange={(event) => onTemplateChange(event.target.value)}
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
          <button className="ghost-button" type="button" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>

      <p className="panel__summary">
        {selectedTemplateName
          ? `Showing ${filteredRunCount} of ${totalRunCount} saved runs for ${selectedTemplateName}.`
          : `Showing ${filteredRunCount} of ${totalRunCount} saved runs.`}
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
    </>
  );
}
