import { Link } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import {
  buildPromptTemplateCreatePath,
  createPromptTemplateCreateNavigationState,
} from '@/features/prompt-templates/lib/prompt-template-links';
import type { PromptTemplate } from '@/types/prompt-template';

interface PromptPlaygroundTemplatePickerProps {
  selectedTemplateId: string;
  templates: PromptTemplate[];
  recentTemplates: PromptTemplate[];
  onTemplateChange: (templateId: string) => void;
}

export function PromptPlaygroundTemplatePicker({
  selectedTemplateId,
  templates,
  recentTemplates,
  onTemplateChange,
}: PromptPlaygroundTemplatePickerProps) {
  const { t } = useLocalization();

  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">{t('playground.picker.eyebrow')}</p>
          <h2>{t('playground.picker.title')}</h2>
        </div>
      </div>

      {templates.length > 0 ? (
        <label className="field">
          <span>{t('playground.picker.active')}</span>
          <select
            value={selectedTemplateId}
            onChange={(event) => onTemplateChange(event.target.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="empty-state empty-state--compact">
          <h2>{t('playground.picker.emptyTitle')}</h2>
          <p>{t('playground.picker.emptyDescription')}</p>
          <Link
            className="primary-button"
            state={createPromptTemplateCreateNavigationState()}
            to={buildPromptTemplateCreatePath()}
          >
            {t('playground.picker.create')}
          </Link>
        </div>
      )}

      {recentTemplates.length > 0 ? (
        <div className="recent-list">
          <h3>{t('playground.picker.recent')}</h3>
          <div className="recent-list__items">
            {recentTemplates.map((template) => (
              <button
                key={template.id}
                className="recent-list__item"
                type="button"
                onClick={() => onTemplateChange(template.id)}
              >
                <strong>{template.name}</strong>
                <span>{template.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
