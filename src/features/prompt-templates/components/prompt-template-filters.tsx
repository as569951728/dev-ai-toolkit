import type { PromptTemplateFilters } from '@/types/prompt-template';

interface PromptTemplateFiltersProps {
  filters: PromptTemplateFilters;
  tags: string[];
  onFiltersChange: (nextFilters: PromptTemplateFilters) => void;
}

export function PromptTemplateFilters({
  filters,
  tags,
  onFiltersChange,
}: PromptTemplateFiltersProps) {
  return (
    <div className="toolbar">
      <label className="toolbar__search">
        <span className="sr-only">Search prompt templates</span>
        <input
          value={filters.search}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              search: event.target.value,
            })
          }
          placeholder="Search by name, tag, or prompt content"
        />
      </label>

      <label className="toolbar__filter">
        <span>Tag</span>
        <select
          value={filters.tag}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              tag: event.target.value,
            })
          }
        >
          <option value="all">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
