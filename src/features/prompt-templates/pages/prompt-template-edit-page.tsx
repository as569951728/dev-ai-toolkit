import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

export function PromptTemplateEditPage() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const { createTemplate, getTemplateById, updateTemplate } =
    usePromptTemplates();

  const template = promptId ? getTemplateById(promptId) : null;
  const [lastTemplate, setLastTemplate] = useState(template);
  const [isDirty, setIsDirty] = useState(false);

  if (template && template !== lastTemplate) {
    setLastTemplate(template);
  }

  const sourceWasDeleted = !template && isDirty;
  const editableTemplate = template ??
    (sourceWasDeleted ? lastTemplate : null);

  if (!editableTemplate) {
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
      initialValue={editableTemplate}
      externalChangeMessage={
        sourceWasDeleted
          ? 'Saved template was deleted in another tab. Your local draft is still here. Restore it as a new template to keep your changes.'
          : undefined
      }
      onDirtyChange={setIsDirty}
      onCancel={() => navigate('/prompts')}
      onSubmit={(value) => {
        if (template) {
          updateTemplate(template.id, value);
        } else {
          createTemplate(value);
        }

        navigate('/prompts');
      }}
      submitLabel={sourceWasDeleted ? 'Restore as new template' : undefined}
    />
  );
}
