interface CodeEditorPanelProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditorPanel({
  title,
  description,
  value,
  onChange,
}: CodeEditorPanelProps) {
  const { t } = useLocalization();

  return (
    <section className="panel code-panel">
      <div className="code-panel__header">
        <div>
          <p className="eyebrow">{t('code.editor.eyebrow')}</p>
          <h2>{title}</h2>
          <p className="panel__summary">{description}</p>
        </div>
      </div>

      <textarea
        aria-label={title}
        className="code-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('code.editor.placeholder')}
        spellCheck={false}
      />
    </section>
  );
}
import { useLocalization } from '@/features/localization/localization-context';
