import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { getPromptTemplateListReturnPath } from '@/features/prompt-templates/lib/prompt-template-links';

export function PromptTemplateEditPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { promptId } = useParams();
  const { createTemplate, getTemplateById, updateTemplate } =
    usePromptTemplates();

  const template = promptId ? getTemplateById(promptId) : null;
  const listPath = getPromptTemplateListReturnPath(location.state);
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
        <Link className="primary-button" to={listPath}>
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
      onCancel={() => navigate(listPath)}
      onSubmit={(value) => {
        if (template) {
          updateTemplate(template.id, value);
        } else {
          createTemplate(value);
        }

        navigate(listPath);
      }}
      submitLabel={sourceWasDeleted ? 'Restore as new template' : undefined}
    />
  );
}
