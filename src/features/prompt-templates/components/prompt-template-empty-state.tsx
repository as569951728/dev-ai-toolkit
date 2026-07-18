interface PromptTemplateEmptyStateProps {
  onCreate: () => void;
  onClearFilters?: () => void;
}

export function PromptTemplateEmptyState({
  onCreate,
  onClearFilters,
}: PromptTemplateEmptyStateProps) {
  const { t } = useLocalization();

  return (
    <div className="empty-state">
      <h2>{t('templates.empty.title')}</h2>
      <p>{t('templates.empty.description')}</p>
      {onClearFilters ? (
        <button className="ghost-button" type="button" onClick={onClearFilters}>
          {t('templates.empty.clear')}
        </button>
      ) : null}
      <button className="primary-button" type="button" onClick={onCreate}>
        {t('templates.empty.create')}
      </button>
    </div>
  );
}
import { useLocalization } from '@/features/localization/localization-context';
