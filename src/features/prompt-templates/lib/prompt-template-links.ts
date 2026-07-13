export function buildPromptTemplateDetailPath(templateId: string) {
  return `/prompts/${encodeURIComponent(templateId)}`;
}
