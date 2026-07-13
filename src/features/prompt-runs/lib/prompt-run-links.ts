import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

interface BuildPromptRunSourceDiffUrlInput {
  run: PromptRunRecord;
  sourceTemplate: PromptTemplate | null | undefined;
}

interface BuildPromptRunPlaygroundPathInput {
  runId: string;
  templateId: string;
}

export function buildPromptRunDetailPath(runId: string) {
  return `/runs/${encodeURIComponent(runId)}`;
}

export function buildPromptTemplateCreateFromRunPath(runId: string) {
  return `/prompts/new?runId=${encodeURIComponent(runId)}`;
}

export function buildPromptRunPlaygroundPath({
  runId,
  templateId,
}: BuildPromptRunPlaygroundPathInput) {
  return `/playground?runId=${encodeURIComponent(runId)}&templateId=${encodeURIComponent(templateId)}`;
}

export function buildPromptRunSourceDiffUrl({
  run,
  sourceTemplate,
}: BuildPromptRunSourceDiffUrlInput) {
  if (!sourceTemplate) {
    return null;
  }

  let sourcePromptText = `${sourceTemplate.systemPrompt}\n\n${sourceTemplate.userPrompt}`;

  if (run.templateVersion !== sourceTemplate.version) {
    const sourceRevision =
      sourceTemplate.revisions.find(
        (revision) => revision.version === run.templateVersion,
      ) ?? null;

    if (!sourceRevision) {
      return null;
    }

    sourcePromptText = `${sourceRevision.systemPrompt}\n\n${sourceRevision.userPrompt}`;
  }
  const runPromptText = `${run.systemPrompt}\n\n${run.userPrompt}`;
  const searchParams = new URLSearchParams({
    left: sourcePromptText,
    right: runPromptText,
  });

  return `/prompt-diff?${searchParams.toString()}`;
}
