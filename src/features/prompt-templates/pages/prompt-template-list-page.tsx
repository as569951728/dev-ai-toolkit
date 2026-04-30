import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { filterPromptTemplates } from '@/features/prompt-templates/lib/prompt-template-utils';
import { PromptTemplateList } from '@/features/prompt-templates/components/prompt-template-list';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import type { PromptTemplateFilters } from '@/types/prompt-template';

export function PromptTemplateListPage() {
  const navigate = useNavigate();
  const { tags, templates } = usePromptTemplates();
  const [filters, setFilters] = useState<PromptTemplateFilters>({
    search: '',
    tag: 'all',
  });

  const filteredTemplates = filterPromptTemplates(templates, filters);

  return (
    <PromptTemplateList
      templates={filteredTemplates}
      tags={tags}
      filters={filters}
      onCreate={() => navigate('/prompts/new')}
      onView={(id) => navigate(`/prompts/${id}`)}
      onEdit={(id) => navigate(`/prompts/${id}/edit`)}
      onFiltersChange={setFilters}
    />
  );
}
