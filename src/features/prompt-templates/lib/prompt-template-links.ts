export function buildPromptTemplateDetailPath(templateId: string) {
  return `/prompts/${encodeURIComponent(templateId)}`;
}

export function buildPromptTemplateEditPath(templateId: string) {
  return `${buildPromptTemplateDetailPath(templateId)}/edit`;
}
