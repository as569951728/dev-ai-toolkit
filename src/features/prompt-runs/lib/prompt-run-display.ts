export function formatCapturedVariableCount(variableCount: number) {
  if (variableCount === 0) {
    return 'No template variables were captured in this run.';
  }

  if (variableCount === 1) {
    return '1 template variable was captured in this run.';
  }

  return `${variableCount} template variables were captured in this run.`;
}

export function getCapturedVariablePreview(
  variables: Record<string, string>,
  limit = 3,
) {
  const entries = Object.entries(variables);

  return {
    entries: entries.slice(0, limit),
    remainingCount: Math.max(entries.length - limit, 0),
  };
}
