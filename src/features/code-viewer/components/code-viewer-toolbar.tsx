import {
  codeViewerLanguageOptions,
  type CodeViewerLanguage,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';

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
  return (
    <div className="code-toolbar">
      <div className="code-toolbar__group">
        <button
          aria-pressed={mode === 'single'}
          className={mode === 'single' ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => onModeChange('single')}
        >
          Single view
        </button>
        <button
          aria-pressed={mode === 'compare'}
          className={mode === 'compare' ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => onModeChange('compare')}
        >
          Compare view
        </button>
      </div>

      <label className="field code-toolbar__language">
        <span>Language</span>
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
          Copy left
        </button>
        <button className="ghost-button" type="button" onClick={onCopyRight}>
          Copy right
        </button>
        <button className="ghost-button" type="button" onClick={onLoadSample}>
          Load sample
        </button>
        <button className="ghost-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
