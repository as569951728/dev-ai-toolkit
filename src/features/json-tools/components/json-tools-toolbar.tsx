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
  return (
    <div className="json-toolbar">
      <button className="primary-button" type="button" onClick={onFormat}>
        Format
      </button>
      <button className="secondary-button" type="button" onClick={onMinify}>
        Minify
      </button>
      <button className="secondary-button" type="button" onClick={onValidate}>
        Validate
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={onCopy}
        disabled={isCopyDisabled}
      >
        Copy result
      </button>
      <button className="ghost-button" type="button" onClick={onLoadSample}>
        Load sample
      </button>
      <button className="ghost-button" type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
