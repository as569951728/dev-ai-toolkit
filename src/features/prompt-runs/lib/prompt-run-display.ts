export function formatCapturedVariableCount(variableCount: number) {
  if (variableCount === 0) {
    return 'No template variables were captured in this run.';
  }

  if (variableCount === 1) {
    return '1 template variable was captured in this run.';
  }

  return `${variableCount} template variables were captured in this run.`;
}
