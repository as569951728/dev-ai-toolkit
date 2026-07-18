import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import { PromptTemplateForm } from '@/features/prompt-templates/components/prompt-template-form';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { getPromptTemplateListReturnPath } from '@/features/prompt-templates/lib/prompt-template-links';

export function PromptTemplateEditPage() {
  const { t } = useLocalization();
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
        <h1>{t('templates.page.notFound')}</h1>
        <p>{t('templates.page.notFoundDescription')}</p>
        <Link className="primary-button" to={listPath}>
          {t('templates.page.back')}
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
          ? t('templates.edit.deleted')
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
      submitLabel={sourceWasDeleted ? t('templates.edit.restore') : undefined}
    />
  );
}
