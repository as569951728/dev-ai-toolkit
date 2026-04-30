import { useNavigate } from 'react-router-dom';

import { PromptTemplateList } from '@/features/prompt-templates/components/prompt-template-list';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

export function PromptTemplateListPage() {
  const navigate = useNavigate();
  const { templates } = usePromptTemplates();

  return (
    <PromptTemplateList
      templates={templates}
      onCreate={() => navigate('/prompts/new')}
      onEdit={(id) => navigate(`/prompts/${id}/edit`)}
    />
  );
}
