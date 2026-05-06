import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PromptTemplateDetail } from '@/features/prompt-templates/components/prompt-template-detail';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

export function PromptTemplateDetailPage() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const { deleteTemplate, duplicateTemplate, getTemplateById } =
    usePromptTemplates();

  const template = promptId ? getTemplateById(promptId) : null;

  if (!template) {
    return <Navigate to="/prompts" replace />;
  }

  return (
    <PromptTemplateDetail
      template={template}
      onBack={() => navigate('/prompts')}
      onOpenInPlayground={(id) => navigate(`/playground?templateId=${id}`)}
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
    />
  );
}
