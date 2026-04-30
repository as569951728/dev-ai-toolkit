import { useNavigate } from 'react-router-dom';

import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

export function PromptTemplateCreatePage() {
  const navigate = useNavigate();
  const { createTemplate } = usePromptTemplates();

  return (
    <PromptTemplateForm
      mode="create"
      onCancel={() => navigate('/prompts')}
      onSubmit={(value) => {
        createTemplate(value);
        navigate('/prompts');
      }}
    />
  );
}
