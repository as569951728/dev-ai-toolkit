import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PromptTemplateDetail } from '@/features/prompt-templates/components/prompt-template-detail';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';

export function PromptTemplateDetailPage() {
  const navigate = useNavigate();
  const { promptId } = useParams();
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
    return <Navigate to="/prompts" replace />;
  }

  const recentRuns = getRunsByTemplateId(template.id, 5);

  return (
    <PromptTemplateDetail
      template={template}
      recentRuns={recentRuns}
      onBack={() => navigate('/prompts')}
      onOpenInPlayground={(id) => navigate(`/playground?templateId=${id}`)}
      onOpenRunHistory={(id) => navigate(`/runs?templateId=${id}`)}
      onEdit={(id) => navigate(`/prompts/${id}/edit`)}
      onDuplicate={(id) => {
        const duplicatedTemplate = duplicateTemplate(id);

        if (duplicatedTemplate) {
          navigate(`/prompts/${duplicatedTemplate.id}`);
        }
      }}
      onDelete={(id) => {
        deleteTemplate(id);
        navigate('/prompts');
      }}
      onArchive={(id) => {
        archiveTemplate(id);
      }}
      onRestoreArchive={(id) => {
        restoreArchivedTemplate(id);
      }}
      onRestoreRevision={(id, revisionVersion) => {
        restoreTemplateRevision(id, revisionVersion);
      }}
    />
  );
}
