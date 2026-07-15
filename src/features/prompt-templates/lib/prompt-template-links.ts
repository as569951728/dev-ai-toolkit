export interface PromptTemplateNavigationState {
  listPath: string;
}

export interface PromptTemplateCreateNavigationState {
  afterCreate: 'playground';
}

export function createPromptTemplateNavigationState(
  listPath: string,
): PromptTemplateNavigationState {
  return { listPath };
}

export function createPromptTemplateCreateNavigationState(
): PromptTemplateCreateNavigationState {
  return { afterCreate: 'playground' };
}

export function getPromptTemplateCreateDestination(state: unknown) {
  return state &&
    typeof state === 'object' &&
    'afterCreate' in state &&
    state.afterCreate === 'playground'
    ? 'playground'
    : 'list';
}

export function getPromptTemplateListReturnPath(state: unknown) {
  if (!state || typeof state !== 'object' || !('listPath' in state)) {
    return '/prompts';
  }

  const listPath = state.listPath;

  return typeof listPath === 'string' &&
    (listPath === '/prompts' || listPath.startsWith('/prompts?'))
    ? listPath
    : '/prompts';
}

export function buildPromptTemplateCreatePath(runId?: string) {
  return runId
    ? `/create-template?runId=${encodeURIComponent(runId)}`
    : '/create-template';
}

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
