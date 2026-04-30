interface PromptTemplateEmptyStateProps {
  onCreate: () => void;
}

export function PromptTemplateEmptyState({
  onCreate,
}: PromptTemplateEmptyStateProps) {
  return (
    <div className="empty-state">
      <h2>No templates match the current filters</h2>
      <p>
        Try a different search, clear the tag filter, or create a new prompt
        template.
      </p>
      <button className="primary-button" type="button" onClick={onCreate}>
        Create template
      </button>
    </div>
  );
}
