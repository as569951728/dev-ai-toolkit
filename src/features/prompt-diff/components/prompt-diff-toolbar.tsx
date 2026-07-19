type PromptDiffToolbarProps = {
  onSwap: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onCopyLeft: () => void;
  onCopyRight: () => void;
};

export function PromptDiffToolbar({
  onSwap,
  onLoadSample,
  onReset,
  onCopyLeft,
  onCopyRight,
}: PromptDiffToolbarProps) {
  const { t } = useLocalization();

  return (
    <div
      className="prompt-diff-toolbar"
      role="toolbar"
      aria-label={t('diff.toolbar.label')}
    >
      <div className="prompt-diff-toolbar__group">
        <button className="secondary-button" type="button" onClick={onSwap}>
          {t('diff.toolbar.swap')}
        </button>
        <button className="secondary-button" type="button" onClick={onLoadSample}>
          {t('diff.toolbar.sample')}
        </button>
        <button className="secondary-button" type="button" onClick={onReset}>
          {t('diff.toolbar.reset')}
        </button>
      </div>

      <div className="prompt-diff-toolbar__group">
        <button className="ghost-button" type="button" onClick={onCopyLeft}>
          {t('diff.toolbar.copyLeft')}
        </button>
        <button className="ghost-button" type="button" onClick={onCopyRight}>
          {t('diff.toolbar.copyRight')}
        </button>
      </div>
    </div>
  );
}
import { useLocalization } from '@/features/localization/localization-context';
