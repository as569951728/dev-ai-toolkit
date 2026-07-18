import { useLocalization } from '@/features/localization/localization-context';
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
  const { t } = useLocalization();

  return (
    <div className="toolbar">
      <label className="toolbar__search">
        <span className="sr-only">{t('templates.filters.searchLabel')}</span>
        <input
          value={filters.search}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              search: event.target.value,
            })
          }
          placeholder={t('templates.filters.searchPlaceholder')}
        />
      </label>

      <label className="toolbar__filter">
        <span>{t('templates.filters.tag')}</span>
        <select
          value={filters.tag}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              tag: event.target.value,
            })
          }
        >
          <option value="all">{t('templates.filters.allTags')}</option>
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
