import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import { PromptTemplateDetail } from '@/features/prompt-templates/components/prompt-template-detail';
import { createPromptDiffNavigationState } from '@/features/prompt-diff/lib/prompt-diff-navigation';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';
import {
  buildPromptTemplateDetailPath,
  buildPromptTemplateEditPath,
  buildPromptTemplatePlaygroundPath,
  buildPromptTemplateRunHistoryPath,
  createPromptTemplateNavigationState,
  getPromptTemplateListReturnPath,
} from '@/features/prompt-templates/lib/prompt-template-links';
import { formatPromptSections } from '@/lib/prompt-sections';

export function PromptTemplateDetailPage() {
  const { t } = useLocalization();
  const location = useLocation();
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
  const listPath = getPromptTemplateListReturnPath(location.state);
  const listNavigationState = createPromptTemplateNavigationState(listPath);

  if (!template) {
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

  const recentRuns = getRunsByTemplateId(template.id, 5);

  function runTemplateAction<T>(action: () => T): T | null {
    setActionErrorMessage(null);

    try {
      return action();
    } catch {
      setActionErrorMessage(
        t('templates.page.updateError'),
      );
      return null;
    }
  }

  return (
    <PromptTemplateDetail
      actionErrorMessage={actionErrorMessage}
      template={template}
      recentRuns={recentRuns}
      onBack={() => navigate(listPath)}
      onOpenInPlayground={(id) =>
        navigate(buildPromptTemplatePlaygroundPath(id))
      }
      onOpenRunHistory={(id) =>
        navigate(buildPromptTemplateRunHistoryPath(id))
      }
      onOpenRunDetail={(id) => navigate(buildPromptRunDetailPath(id))}
      onCompareRevision={(revision) => {
        navigate('/prompt-diff', {
          state: createPromptDiffNavigationState({
            left: formatPromptSections(revision),
            right: formatPromptSections(template),
          }),
        });
      }}
      onEdit={(id) =>
        navigate(buildPromptTemplateEditPath(id), {
          state: listNavigationState,
        })
      }
      onDuplicate={(id) => {
        const duplicatedTemplate = runTemplateAction(() =>
          duplicateTemplate(id),
        );

        if (duplicatedTemplate) {
          navigate(buildPromptTemplateDetailPath(duplicatedTemplate.id), {
            state: listNavigationState,
          });
        }
      }}
      onDelete={(id) => {
        const deleted = runTemplateAction(() => {
          deleteTemplate(id);
          return true;
        });

        if (deleted) {
          navigate(listPath);
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
