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
  return (
    <section className="panel code-panel">
      <div className="code-panel__header">
        <div>
          <p className="eyebrow">Input</p>
          <h2>{title}</h2>
          <p className="panel__summary">{description}</p>
        </div>
      </div>

      <textarea
        className="code-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste code, JSON, markdown, or any structured text output here."
        spellCheck={false}
      />
    </section>
  );
}
