import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  buildPromptTemplatePlaygroundPath,
  getPromptTemplateCreateDestination,
} from '@/features/prompt-templates/lib/prompt-template-links';

export function PromptTemplateCreatePage() {
  const { t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createTemplate } = usePromptTemplates();
  const { getRunById } = usePromptRuns();
  const requestedRunId = searchParams.get('runId');
  const createDestination = getPromptTemplateCreateDestination(location.state);
  const sourceRun = requestedRunId ? getRunById(requestedRunId) : null;
  const initialValue = sourceRun
    ? {
        name: `${sourceRun.templateName} ${t('templates.create.snapshotSuffix')}`,
        description: t('templates.create.snapshotDescription'),
        systemPrompt: sourceRun.systemPrompt,
        userPrompt: sourceRun.userPrompt,
        tags: [],
      }
    : null;

  return (
    <>
      {sourceRun ? (
        <p className="status-banner" role="status">
          {t('templates.create.prefilled')}
        </p>
      ) : requestedRunId ? (
        <p className="status-banner status-banner--error" role="alert">
          {t('templates.create.runMissing')}
        </p>
      ) : null}

      <PromptTemplateForm
        mode="create"
        initialValue={initialValue}
        onCancel={() => navigate('/prompts')}
        onSubmit={(value) => {
          const createdTemplate = createTemplate(value);

          navigate(
            createDestination === 'playground'
              ? buildPromptTemplatePlaygroundPath(createdTemplate.id)
              : '/prompts',
          );
        }}
      />
    </>
  );
}
