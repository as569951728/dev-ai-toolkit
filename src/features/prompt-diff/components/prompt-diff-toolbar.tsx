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
  return (
    <div className="prompt-diff-toolbar" role="toolbar" aria-label="Prompt diff actions">
      <div className="prompt-diff-toolbar__group">
        <button className="secondary-button" type="button" onClick={onSwap}>
          Swap sides
        </button>
        <button className="secondary-button" type="button" onClick={onLoadSample}>
          Load sample
        </button>
        <button className="secondary-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="prompt-diff-toolbar__group">
        <button className="ghost-button" type="button" onClick={onCopyLeft}>
          Copy left prompt
        </button>
        <button className="ghost-button" type="button" onClick={onCopyRight}>
          Copy right prompt
        </button>
      </div>
    </div>
  );
}
