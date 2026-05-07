import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { filterPromptTemplates } from '@/features/prompt-templates/lib/prompt-template-utils';
import {
  parsePromptTemplateImport,
  stringifyPromptTemplateExport,
} from '@/features/prompt-templates/lib/prompt-template-transfer';
import { PromptTemplateList } from '@/features/prompt-templates/components/prompt-template-list';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import type { PromptTemplateFilters } from '@/types/prompt-template';

export function PromptTemplateListPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { importTemplates, tags, templates } = usePromptTemplates();
  const [filters, setFilters] = useState<PromptTemplateFilters>({
    search: '',
    tag: 'all',
  });
  const [showArchived, setShowArchived] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const visibleTemplates = showArchived
    ? templates
    : templates.filter((template) => !template.archivedAt);
  const archivedCount = templates.filter((template) => template.archivedAt).length;
  const filteredTemplates = filterPromptTemplates(visibleTemplates, filters);

  const handleExport = () => {
    const json = stringifyPromptTemplateExport(templates);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `dev-ai-toolkit-prompts-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    setStatusMessage(`Exported ${templates.length} templates to JSON.`);
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

      setStatusMessage(
        `Imported ${result.total} templates: ${result.created} created, ${result.updated} updated.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Failed to import the selected JSON file.',
      );
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        accept="application/json"
        onChange={handleImport}
      />

      <PromptTemplateList
        templates={filteredTemplates}
        tags={tags}
        filters={filters}
        statusMessage={statusMessage}
        archivedCount={archivedCount}
        showArchived={showArchived}
        onCreate={() => navigate('/prompts/new')}
        onView={(id) => navigate(`/prompts/${id}`)}
        onEdit={(id) => navigate(`/prompts/${id}/edit`)}
        onOpenInPlayground={(id) => navigate(`/playground?templateId=${id}`)}
        onFiltersChange={setFilters}
        onToggleArchived={() => setShowArchived((currentValue) => !currentValue)}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
      />
    </>
  );
}
