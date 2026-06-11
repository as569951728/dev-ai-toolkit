import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

interface BuildPromptRunSourceDiffUrlInput {
  run: PromptRunRecord;
  sourceTemplate: PromptTemplate | null | undefined;
}

export function buildPromptRunSourceDiffUrl({
  run,
  sourceTemplate,
}: BuildPromptRunSourceDiffUrlInput) {
  if (!sourceTemplate) {
    return null;
  }

  const sourceRevision =
    sourceTemplate.revisions.find(
      (revision) => revision.version === run.templateVersion,
    ) ?? null;
  const sourcePromptText = `${sourceRevision?.systemPrompt ?? sourceTemplate.systemPrompt}\n\n${
    sourceRevision?.userPrompt ?? sourceTemplate.userPrompt
  }`;
  const runPromptText = `${run.systemPrompt}\n\n${run.userPrompt}`;
  const searchParams = new URLSearchParams({
    left: sourcePromptText,
    right: runPromptText,
  });

  return `/prompt-diff?${searchParams.toString()}`;
}
