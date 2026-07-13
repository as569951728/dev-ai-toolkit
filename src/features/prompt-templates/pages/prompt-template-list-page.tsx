import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { filterPromptTemplates } from '@/features/prompt-templates/lib/prompt-template-utils';
import {
  parsePromptTemplateImport,
  stringifyPromptTemplateExport,
} from '@/features/prompt-templates/lib/prompt-template-transfer';
import { PromptTemplateList } from '@/features/prompt-templates/components/prompt-template-list';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { collectPromptTemplateTags } from '@/features/prompt-templates/services/prompt-template-service';
import type { PromptTemplateFilters } from '@/types/prompt-template';

interface PromptTemplateFeedback {
  message: string;
  tone: 'success' | 'error';
}

export function PromptTemplateListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { importTemplates, templates } = usePromptTemplates();
  const filters: PromptTemplateFilters = {
    search: searchParams.get('search') ?? '',
    tag: searchParams.get('tag') ?? 'all',
  };
  const showArchived = searchParams.get('archived') === '1';
  const [feedback, setFeedback] = useState<PromptTemplateFeedback | null>(null);

  const visibleTemplates = showArchived
    ? templates
    : templates.filter((template) => !template.archivedAt);
  const archivedCount = templates.filter((template) => template.archivedAt).length;
  const visibleTags = collectPromptTemplateTags(visibleTemplates);
  const filteredTemplates = filterPromptTemplates(visibleTemplates, filters);

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
      link.download = `dev-ai-toolkit-prompts-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();

      setFeedback({
        message: `Exported ${templates.length} templates to JSON.`,
        tone: 'success',
      });
    } catch {
      setFeedback({
        message: 'Failed to export prompt templates. Please try again.',
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
      const fileContent = await file.text();
      const { importedTemplates, summary } = parsePromptTemplateImport(
        fileContent,
        templates,
      );
      const result = importTemplates(importedTemplates, summary);

      setFeedback({
        message: `Imported ${result.total} templates: ${result.created} created, ${result.updated} updated.`,
        tone: 'success',
      });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to import the selected JSON file.',
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
        aria-label="Import prompt templates JSON"
        className="sr-only"
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
        onCreate={() => navigate('/prompts/new')}
        onView={(id) => navigate(`/prompts/${id}`)}
        onEdit={(id) => navigate(`/prompts/${id}/edit`)}
        onOpenInPlayground={(id) => navigate(`/playground?templateId=${id}`)}
        onOpenRunHistory={(id) => navigate(`/runs?templateId=${id}`)}
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
