import type {
  PromptTemplate,
  PromptTemplateFilters,
} from '@/types/prompt-template';

export function createTemplateId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug || 'prompt'}-${crypto.randomUUID().slice(0, 8)}`;
}

export function filterPromptTemplates(
  templates: PromptTemplate[],
  filters: PromptTemplateFilters,
) {
  const searchValue = filters.search.trim().toLowerCase();

  return templates.filter((template) => {
    const matchesTag =
      filters.tag === 'all' || template.tags.includes(filters.tag);

    if (!matchesTag) {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    const haystack = [
      template.name,
      template.description,
      template.systemPrompt,
      template.userPrompt,
      template.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchValue);
  });
}
