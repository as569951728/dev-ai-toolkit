import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PromptTemplateDetail } from '@/features/prompt-templates/components/prompt-template-detail';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';

export function PromptTemplateDetailPage() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );
  const { getRunsByTemplateId } = usePromptRuns();
  const {
    archiveTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplateById,
    restoreArchivedTemplate,
    restoreTemplateRevision,
  } = usePromptTemplates();

  const template = promptId ? getTemplateById(promptId) : null;

  if (!template) {
    return (
      <section className="panel empty-state">
        <h1>Template not found</h1>
        <p>The prompt template may have been removed from local storage.</p>
        <Link className="primary-button" to="/prompts">
          Back to Prompt Templates
        </Link>
      </section>
    );
  }

  const recentRuns = getRunsByTemplateId(template.id, 5);

  function runTemplateAction<T>(action: () => T): T | null {
    setActionErrorMessage(null);

    try {
      return action();
    } catch {
      setActionErrorMessage(
        'Failed to update this template. Check that browser storage is available and try again.',
      );
      return null;
    }
  }

  return (
    <PromptTemplateDetail
      actionErrorMessage={actionErrorMessage}
      template={template}
      recentRuns={recentRuns}
      onBack={() => navigate('/prompts')}
      onOpenInPlayground={(id) => navigate(`/playground?templateId=${id}`)}
      onOpenRunHistory={(id) => navigate(`/runs?templateId=${id}`)}
      onOpenRunDetail={(id) => navigate(buildPromptRunDetailPath(id))}
      onEdit={(id) => navigate(`/prompts/${id}/edit`)}
      onDuplicate={(id) => {
        const duplicatedTemplate = runTemplateAction(() =>
          duplicateTemplate(id),
        );

        if (duplicatedTemplate) {
          navigate(`/prompts/${duplicatedTemplate.id}`);
        }
      }}
      onDelete={(id) => {
        const deleted = runTemplateAction(() => {
          deleteTemplate(id);
          return true;
        });

        if (deleted) {
          navigate('/prompts');
        }
      }}
      onArchive={(id) => {
        runTemplateAction(() => archiveTemplate(id));
      }}
      onRestoreArchive={(id) => {
        runTemplateAction(() => restoreArchivedTemplate(id));
      }}
      onRestoreRevision={(id, revisionVersion) => {
        return Boolean(
          runTemplateAction(() =>
            restoreTemplateRevision(id, revisionVersion),
          ),
        );
      }}
    />
  );
}
