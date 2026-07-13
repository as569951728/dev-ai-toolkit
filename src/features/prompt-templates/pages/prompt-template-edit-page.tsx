import { Link, useNavigate, useParams } from 'react-router-dom';

import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

export function PromptTemplateEditPage() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const { getTemplateById, updateTemplate } = usePromptTemplates();

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

  return (
    <PromptTemplateForm
      mode="edit"
      initialValue={template}
      onCancel={() => navigate('/prompts')}
      onSubmit={(value) => {
        updateTemplate(template.id, value);
        navigate('/prompts');
      }}
    />
  );
}
