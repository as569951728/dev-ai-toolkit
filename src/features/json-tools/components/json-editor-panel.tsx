interface JsonEditorPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function JsonEditorPanel({
  value,
  onChange,
}: JsonEditorPanelProps) {
  const { t } = useLocalization();

  return (
    <section className="panel json-panel">
      <div className="json-panel__header">
        <div>
          <p className="eyebrow">{t('json.input.eyebrow')}</p>
          <h2>{t('json.input.title')}</h2>
        </div>
      </div>

      <label className="field">
        <span className="sr-only">{t('json.input.label')}</span>
        <textarea
          className="json-textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('json.input.placeholder')}
          spellCheck={false}
        />
      </label>
    </section>
  );
}
import { useLocalization } from '@/features/localization/localization-context';
