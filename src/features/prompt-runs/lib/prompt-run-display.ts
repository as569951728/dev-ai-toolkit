import type { AppLanguage } from '@/features/localization/translations';

export function formatPromptRunCreatedAt(
  createdAt: string,
  language: AppLanguage = 'en',
) {
  return new Intl.DateTimeFormat(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

export function formatCapturedVariableCount(
  variableCount: number,
  language: AppLanguage = 'en',
) {
  if (language === 'zh-CN') {
    return variableCount === 0
      ? '这次运行没有记录模板变量。'
      : `这次运行记录了 ${variableCount} 个模板变量。`;
  }

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
