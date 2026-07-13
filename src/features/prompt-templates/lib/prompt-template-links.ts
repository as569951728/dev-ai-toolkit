export function buildPromptTemplateDetailPath(templateId: string) {
  return `/prompts/${encodeURIComponent(templateId)}`;
}

export function buildPromptTemplateEditPath(templateId: string) {
  return `${buildPromptTemplateDetailPath(templateId)}/edit`;
}

export function buildPromptTemplatePlaygroundPath(templateId: string) {
  return `/playground?templateId=${encodeURIComponent(templateId)}`;
}

export function buildPromptTemplateRunHistoryPath(templateId: string) {
  return `/runs?templateId=${encodeURIComponent(templateId)}`;
}
