interface JsonEditorPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function JsonEditorPanel({
  value,
  onChange,
}: JsonEditorPanelProps) {
  return (
    <section className="panel json-panel">
      <div className="json-panel__header">
        <div>
          <p className="eyebrow">Input</p>
          <h2>Paste raw JSON</h2>
        </div>
      </div>

      <label className="field">
        <span className="sr-only">JSON input</span>
        <textarea
          className="json-textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder='Paste JSON here, for example {"name":"dev-ai-toolkit"}'
          spellCheck={false}
        />
      </label>
    </section>
  );
}
