export type CodeViewerMode = 'single' | 'compare';

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
