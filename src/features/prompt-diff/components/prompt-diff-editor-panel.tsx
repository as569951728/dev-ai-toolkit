type PromptDiffEditorPanelProps = {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
};

export function PromptDiffEditorPanel({
  title,
  description,
  value,
  onChange,
}: PromptDiffEditorPanelProps) {
  return (
    <section className="panel prompt-diff-panel">
      <div className="prompt-diff-panel__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <textarea
        className="code-textarea prompt-diff-textarea"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        spellCheck={false}
      />
    </section>
  );
}
