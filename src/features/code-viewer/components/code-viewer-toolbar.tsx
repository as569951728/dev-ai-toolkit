import {
  codeViewerLanguageOptions,
  type CodeViewerLanguage,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';
import { useLocalization } from '@/features/localization/localization-context';

interface CodeViewerToolbarProps {
  mode: CodeViewerMode;
  language: CodeViewerLanguage;
  onModeChange: (mode: CodeViewerMode) => void;
  onLanguageChange: (language: CodeViewerLanguage) => void;
  onCopyLeft: () => void;
  onCopyRight: () => void;
  onLoadSample: () => void;
  onReset: () => void;
}

export function CodeViewerToolbar({
  mode,
  language,
  onModeChange,
  onLanguageChange,
  onCopyLeft,
  onCopyRight,
  onLoadSample,
  onReset,
}: CodeViewerToolbarProps) {
  const { t } = useLocalization();

  return (
    <div className="code-toolbar">
      <div className="code-toolbar__group">
        <button
          aria-pressed={mode === 'single'}
          className={mode === 'single' ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => onModeChange('single')}
        >
          {t('code.toolbar.single')}
        </button>
        <button
          aria-pressed={mode === 'compare'}
          className={mode === 'compare' ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => onModeChange('compare')}
        >
          {t('code.toolbar.compare')}
        </button>
      </div>

      <label className="field code-toolbar__language">
        <span>{t('code.toolbar.language')}</span>
        <select
          value={language}
          onChange={(event) =>
            onLanguageChange(event.target.value as CodeViewerLanguage)
          }
        >
          {codeViewerLanguageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="code-toolbar__group">
        <button className="ghost-button" type="button" onClick={onCopyLeft}>
          {t('code.toolbar.copyLeft')}
        </button>
        <button className="ghost-button" type="button" onClick={onCopyRight}>
          {t('code.toolbar.copyRight')}
        </button>
        <button className="ghost-button" type="button" onClick={onLoadSample}>
          {t('code.toolbar.sample')}
        </button>
        <button className="ghost-button" type="button" onClick={onReset}>
          {t('code.toolbar.reset')}
        </button>
      </div>
    </div>
  );
}
