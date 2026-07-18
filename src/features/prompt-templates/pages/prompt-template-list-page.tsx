import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import { filterPromptTemplates } from '@/features/prompt-templates/lib/prompt-template-utils';
import { normalizePromptTemplateListSearchParams } from '@/features/prompt-templates/lib/prompt-template-list-query';
import {
  parsePromptTemplateImport,
  stringifyPromptTemplateExport,
} from '@/features/prompt-templates/lib/prompt-template-transfer';
import { PromptTemplateList } from '@/features/prompt-templates/components/prompt-template-list';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  buildPromptTemplateCreatePath,
  buildPromptTemplateDetailPath,
  buildPromptTemplateEditPath,
  buildPromptTemplatePlaygroundPath,
  buildPromptTemplateRunHistoryPath,
  createPromptTemplateNavigationState,
} from '@/features/prompt-templates/lib/prompt-template-links';
import { collectPromptTemplateTags } from '@/features/prompt-templates/services/prompt-template-service';
import { formatLocalDateForFilename } from '@/lib/filename-date';
import { readJsonImportFile } from '@/lib/json-import-file';
import type { PromptTemplateFilters } from '@/types/prompt-template';

interface PromptTemplateFeedback {
  message: string;
  tone: 'success' | 'error';
}

export function PromptTemplateListPage() {
  const { language, t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { importTemplates, templates } = usePromptTemplates();
  const showArchived = searchParams.get('archived') === '1';
  const [feedback, setFeedback] = useState<PromptTemplateFeedback | null>(null);
  const listNavigationState = createPromptTemplateNavigationState(
    `${location.pathname}${location.search}`,
  );

  const visibleTemplates = showArchived
    ? templates
    : templates.filter((template) => !template.archivedAt);
  const archivedCount = templates.filter((template) => template.archivedAt).length;
  const visibleTags = collectPromptTemplateTags(visibleTemplates);
  const requestedTag = searchParams.get('tag') ?? 'all';
  const hasRequestedTag =
    requestedTag === 'all' || visibleTags.includes(requestedTag);
  const filters: PromptTemplateFilters = {
    search: searchParams.get('search') ?? '',
    tag: hasRequestedTag ? requestedTag : 'all',
  };
  const filteredTemplates = filterPromptTemplates(visibleTemplates, filters);

  useEffect(() => {
    const normalizedSearchParams = normalizePromptTemplateListSearchParams(
      searchParams,
      { hasRequestedTag },
    );

    if (!normalizedSearchParams) {
      return;
    }

    setSearchParams(normalizedSearchParams, { replace: true });
  }, [hasRequestedTag, searchParams, setSearchParams]);

  const updateListSearchParams = (
    nextFilters: PromptTemplateFilters,
    nextShowArchived: boolean,
  ) => {
    const nextSearchParams = new URLSearchParams();
    const normalizedSearchValue = nextFilters.search.trim();

    if (normalizedSearchValue) {
      nextSearchParams.set('search', nextFilters.search);
    }

    if (nextFilters.tag !== 'all') {
      nextSearchParams.set('tag', nextFilters.tag);
    }

    if (nextShowArchived) {
      nextSearchParams.set('archived', '1');
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleExport = () => {
    let objectUrl = '';

    try {
      const json = stringifyPromptTemplateExport(templates);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');

      objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download =
        `dev-ai-toolkit-prompts-${formatLocalDateForFilename()}.json`;
      link.click();

      setFeedback({
        message: t('templates.list.exportSuccess', {
          count: templates.length,
        }),
        tone: 'success',
      });
    } catch {
      setFeedback({
        message: t('templates.list.exportError'),
        tone: 'error',
      });
    } finally {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    }
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const fileContent = await readJsonImportFile(file);
      const { importedTemplates, summary } = parsePromptTemplateImport(
        fileContent,
        templates,
      );
      const result = importTemplates(importedTemplates, summary);
      const skippedMessage = result.skipped
        ? t('templates.list.importSkipped', { count: result.skipped })
        : '';
      const duplicateMessage = result.duplicates
        ? t(
            result.duplicates === 1
              ? 'templates.list.importDuplicates.one'
              : 'templates.list.importDuplicates.other',
            { count: result.duplicates },
          )
        : '';
      const templateLabel = t(
        result.total === 1
          ? 'templates.list.importTemplate.one'
          : 'templates.list.importTemplate.other',
      );

      setFeedback({
        message: t('templates.list.importSuccess', {
          total: result.total,
          label: templateLabel,
          created: result.created,
          updated: result.updated,
          skipped: skippedMessage,
          duplicates: duplicateMessage,
        }),
        tone: 'success',
      });
    } catch (error) {
      setFeedback({
        message:
          language === 'en' && error instanceof Error
            ? error.message
            : t('templates.list.importError'),
        tone: 'error',
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        aria-label={t('templates.list.importLabel')}
        hidden
        type="file"
        accept="application/json,.json"
        onChange={handleImport}
      />

      <PromptTemplateList
        templates={filteredTemplates}
        tags={visibleTags}
        filters={filters}
        statusMessage={feedback?.message ?? null}
        statusTone={feedback?.tone ?? 'success'}
        archivedCount={archivedCount}
        showArchived={showArchived}
        onCreate={() => navigate(buildPromptTemplateCreatePath())}
        onView={(id) =>
          navigate(buildPromptTemplateDetailPath(id), {
            state: listNavigationState,
          })
        }
        onEdit={(id) =>
          navigate(buildPromptTemplateEditPath(id), {
            state: listNavigationState,
          })
        }
        onOpenInPlayground={(id) =>
          navigate(buildPromptTemplatePlaygroundPath(id))
        }
        onOpenRunHistory={(id) =>
          navigate(buildPromptTemplateRunHistoryPath(id))
        }
        onFiltersChange={(nextFilters) =>
          updateListSearchParams(nextFilters, showArchived)
        }
        onToggleArchived={() =>
          updateListSearchParams(filters, !showArchived)
        }
        onClearFilters={() =>
          updateListSearchParams(
            {
              search: '',
              tag: 'all',
            },
            false,
          )
        }
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
      />
    </>
  );
}
