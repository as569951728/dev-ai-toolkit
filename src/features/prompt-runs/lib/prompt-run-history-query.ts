export type PromptRunSortOrder = 'newest' | 'oldest';

interface BuildPromptRunHistorySearchParamsOptions {
  searchValue: string;
  sortOrder: PromptRunSortOrder;
  templateId: string;
}

interface NormalizePromptRunHistorySearchParamsOptions {
  hasRequestedTemplate: boolean;
}

export function getPromptRunSortOrder(
  searchParams: URLSearchParams,
): PromptRunSortOrder {
  return searchParams.get('order') === 'oldest' ? 'oldest' : 'newest';
}

export function buildPromptRunHistorySearchParams({
  searchValue,
  sortOrder,
  templateId,
}: BuildPromptRunHistorySearchParamsOptions) {
  const searchParams = new URLSearchParams();

  if (templateId !== 'all') {
    searchParams.set('templateId', templateId);
  }

  if (searchValue.trim()) {
    searchParams.set('q', searchValue);
  }

  if (sortOrder === 'oldest') {
    searchParams.set('order', 'oldest');
  }

  return searchParams;
}

export function normalizePromptRunHistorySearchParams(
  searchParams: URLSearchParams,
  { hasRequestedTemplate }: NormalizePromptRunHistorySearchParamsOptions,
) {
  const requestedSortOrder = searchParams.get('order');
  const requestedSearch = searchParams.get('q');
  const requestedTemplateId = searchParams.get('templateId') ?? 'all';
  const hasUnsupportedSortOrder =
    requestedSortOrder !== null && requestedSortOrder !== 'oldest';
  const hasEmptySearch =
    requestedSearch !== null && requestedSearch.trim().length === 0;
  const hasDefaultTemplateFilter =
    searchParams.has('templateId') && requestedTemplateId === 'all';
  const hasUnknownTemplateFilter =
    requestedTemplateId !== 'all' && !hasRequestedTemplate;

  if (
    !hasUnsupportedSortOrder &&
    !hasEmptySearch &&
    !hasDefaultTemplateFilter &&
    !hasUnknownTemplateFilter
  ) {
    return null;
  }

  const normalizedSearchParams = new URLSearchParams(searchParams);

  if (hasUnsupportedSortOrder) {
    normalizedSearchParams.delete('order');
  }

  if (hasEmptySearch) {
    normalizedSearchParams.delete('q');
  }

  if (hasDefaultTemplateFilter || hasUnknownTemplateFilter) {
    normalizedSearchParams.delete('templateId');
  }

  return normalizedSearchParams;
}
