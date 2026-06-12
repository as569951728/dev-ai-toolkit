export type CodeViewerMode = 'single' | 'compare';

export const codeViewerLanguageOptions = [
  'plaintext',
  'typescript',
  'javascript',
  'json',
  'markdown',
  'bash',
] as const;

export type CodeViewerLanguage = (typeof codeViewerLanguageOptions)[number];

export const codeViewerSampleLeft = `function summarizePrompt(template) {
  return {
    id: template.id,
    title: template.name,
    tagCount: template.tags.length,
  };
}

export default summarizePrompt;`;

export const codeViewerSampleRight = `function summarizePrompt(template) {
  return {
    id: template.id,
    title: template.name,
    tags: template.tags,
    tagCount: template.tags.length,
    updatedAt: template.updatedAt,
  };
}

export default summarizePrompt;`;

export function countCharacters(value: string) {
  return value.length;
}

export function countLines(value: string) {
  return value.length === 0 ? 0 : value.split('\n').length;
}

export function normalizeCodeViewerLanguage(
  value: string | null | undefined,
  fallback: CodeViewerLanguage = 'plaintext',
): CodeViewerLanguage {
  return codeViewerLanguageOptions.includes(value as CodeViewerLanguage)
    ? (value as CodeViewerLanguage)
    : fallback;
}

interface BuildCodeViewerUrlInput {
  left: string;
  right?: string;
  mode?: CodeViewerMode;
  language?: CodeViewerLanguage;
}

export function buildCodeViewerUrl({
  left,
  right,
  mode = 'compare',
  language = 'plaintext',
}: BuildCodeViewerUrlInput) {
  const searchParams = new URLSearchParams({
    left,
    mode,
    language,
  });

  if (typeof right === 'string') {
    searchParams.set('right', right);
  }

  return `/code-viewer?${searchParams.toString()}`;
}
