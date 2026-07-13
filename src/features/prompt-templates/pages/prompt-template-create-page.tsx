import { useNavigate, useSearchParams } from 'react-router-dom';

import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import type { PromptTemplateInput } from '@/types/prompt-template';

function createTemplateInputFromRun({
  systemPrompt,
  templateName,
  userPrompt,
}: {
  systemPrompt: string;
  templateName: string;
  userPrompt: string;
}): PromptTemplateInput {
  return {
    name: `${templateName} snapshot`,
    description: 'Created from a saved prompt snapshot.',
    systemPrompt,
    userPrompt,
    tags: [],
  };
}

export function PromptTemplateCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createTemplate } = usePromptTemplates();
  const { getRunById } = usePromptRuns();
  const requestedRunId = searchParams.get('runId');
  const sourceRun = requestedRunId ? getRunById(requestedRunId) : null;
  const initialValue = sourceRun ? createTemplateInputFromRun(sourceRun) : null;

  return (
    <>
      {sourceRun ? (
        <p className="status-banner" role="status">
          Prefilled from a saved prompt snapshot. Review the resolved prompt
          values and add any reusable placeholders before creating the template.
        </p>
      ) : requestedRunId ? (
        <p className="status-banner status-banner--error" role="alert">
          The requested saved run is no longer available. Start with a blank
          template instead.
        </p>
      ) : null}

      <PromptTemplateForm
        mode="create"
        initialValue={initialValue}
        onCancel={() => navigate('/prompts')}
        onSubmit={(value) => {
          createTemplate(value);
          navigate('/prompts');
        }}
      />
    </>
  );
}
