interface JsonToolsToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onCopy: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  isCopyDisabled: boolean;
}

export function JsonToolsToolbar({
  onFormat,
  onMinify,
  onValidate,
  onCopy,
  onLoadSample,
  onReset,
  isCopyDisabled,
}: JsonToolsToolbarProps) {
  const { t } = useLocalization();

  return (
    <div className="json-toolbar">
      <button className="primary-button" type="button" onClick={onFormat}>
        {t('json.toolbar.format')}
      </button>
      <button className="secondary-button" type="button" onClick={onMinify}>
        {t('json.toolbar.minify')}
      </button>
      <button className="secondary-button" type="button" onClick={onValidate}>
        {t('json.toolbar.validate')}
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={onCopy}
        disabled={isCopyDisabled}
      >
        {t('json.toolbar.copy')}
      </button>
      <button className="ghost-button" type="button" onClick={onLoadSample}>
        {t('json.toolbar.sample')}
      </button>
      <button className="ghost-button" type="button" onClick={onReset}>
        {t('json.toolbar.reset')}
      </button>
    </div>
  );
}
import { useLocalization } from '@/features/localization/localization-context';
