import type { PromptTemplate } from '@/types/prompt-template';

import { useLocalization } from '@/features/localization/localization-context';
import type { PromptPlaygroundVariable } from '@/features/prompt-playground/lib/prompt-playground-utils';

interface PromptPlaygroundVariableFormProps {
  selectedTemplate: PromptTemplate | null;
  variables: PromptPlaygroundVariable[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}

export function PromptPlaygroundVariableForm({
  selectedTemplate,
  variables,
  values,
  onValueChange,
}: PromptPlaygroundVariableFormProps) {
  const { language, t } = useLocalization();

  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">{t('playground.variables.eyebrow')}</p>
          <h2>{t('playground.variables.title')}</h2>
          <p className="panel__summary">
            {t('playground.variables.descriptionPrefix')}{' '}
            <code>{'{{placeholder}}'}</code>{' '}
            {t('playground.variables.descriptionSuffix')}
          </p>
        </div>
      </div>

      {selectedTemplate ? (
        variables.length > 0 ? (
          <form className="playground-form">
            {variables.map((variable) => (
              <label className="field" key={variable.key}>
                <span>{variable.label}</span>
                <textarea
                  rows={4}
                  value={values[variable.key] ?? ''}
                  onChange={(event) =>
                    onValueChange(variable.key, event.target.value)
                  }
                  placeholder={t('playground.variables.placeholder', {
                    label:
                      language === 'en'
                        ? variable.label.toLowerCase()
                        : variable.label,
                  })}
                />
              </label>
            ))}
          </form>
        ) : (
          <div className="empty-state">
            <h2>{t('playground.variables.emptyTitle')}</h2>
            <p>
              {t('playground.variables.emptyPrefix')}{' '}
              <code>{'{{variable}}'}</code>{' '}
              {t('playground.variables.emptySuffix')}
            </p>
          </div>
        )
      ) : (
        <div className="empty-state">
          <h2>{t('playground.variables.noTemplate')}</h2>
          <p>{t('playground.variables.noTemplateDescription')}</p>
        </div>
      )}
    </section>
  );
}
