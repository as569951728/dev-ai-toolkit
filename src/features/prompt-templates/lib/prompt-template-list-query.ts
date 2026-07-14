interface NormalizePromptTemplateListSearchParamsOptions {
  hasRequestedTag: boolean;
}

export function normalizePromptTemplateListSearchParams(
  searchParams: URLSearchParams,
  { hasRequestedTag }: NormalizePromptTemplateListSearchParamsOptions,
) {
  const requestedArchived = searchParams.get('archived');
  const requestedSearch = searchParams.get('search');
  const requestedTag = searchParams.get('tag');
  const hasUnsupportedArchived =
    requestedArchived !== null && requestedArchived !== '1';
  const hasEmptySearch =
    requestedSearch !== null && requestedSearch.trim().length === 0;
  const hasInactiveTag =
    requestedTag !== null &&
    (requestedTag === 'all' || !hasRequestedTag);

  if (!hasUnsupportedArchived && !hasEmptySearch && !hasInactiveTag) {
    return null;
  }

  const normalizedSearchParams = new URLSearchParams(searchParams);

  if (hasUnsupportedArchived) {
    normalizedSearchParams.delete('archived');
  }

  if (hasEmptySearch) {
    normalizedSearchParams.delete('search');
  }

  if (hasInactiveTag) {
    normalizedSearchParams.delete('tag');
  }

  return normalizedSearchParams;
}
