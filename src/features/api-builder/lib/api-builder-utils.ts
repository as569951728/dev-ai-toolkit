export interface ApiFieldPair {
  id: string;
  key: string;
  value: string;
}

export interface ApiBuilderState {
  method: string;
  url: string;
  queryParams: ApiFieldPair[];
  headers: ApiFieldPair[];
  body: string;
}

export const apiBuilderSampleState: ApiBuilderState = {
  method: 'POST',
  url: 'https://api.example.com/v1/prompts/render',
  queryParams: [
    {
      id: 'query-1',
      key: 'workspace',
      value: 'dev-ai-toolkit',
    },
  ],
  headers: [
    {
      id: 'header-1',
      key: 'Authorization',
      value: 'Bearer <token>',
    },
    {
      id: 'header-2',
      key: 'Content-Type',
      value: 'application/json',
    },
  ],
  body: `{
  "templateId": "code-review-assistant",
  "variables": {
    "repository_name": "dev-ai-toolkit",
    "change_scope": "frontend"
  }
}`,
};

function cleanPairs(pairs: ApiFieldPair[]) {
  return pairs.filter((pair) => pair.key.trim() || pair.value.trim());
}

function normalizeHttpMethod(method: string) {
  return method.trim().toUpperCase() || 'GET';
}

export function buildRequestUrl(
  baseUrl: string,
  queryParams: ApiFieldPair[],
) {
  const trimmedUrl = baseUrl.trim();

  if (!trimmedUrl) {
    return '';
  }

  const activeParams = cleanPairs(queryParams);

  if (activeParams.length === 0) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    for (const pair of activeParams) {
      if (pair.key.trim()) {
        parsedUrl.searchParams.set(pair.key.trim(), pair.value.trim());
      }
    }

    return parsedUrl.toString();
  } catch {
    const queryString = activeParams
      .filter((pair) => pair.key.trim())
      .map(
        (pair) =>
          `${encodeURIComponent(pair.key.trim())}=${encodeURIComponent(pair.value.trim())}`,
      )
      .join('&');

    if (!queryString) {
      return trimmedUrl;
    }

    const separator =
      trimmedUrl.includes('?') && !trimmedUrl.endsWith('?') && !trimmedUrl.endsWith('&')
        ? '&'
        : trimmedUrl.includes('?')
          ? ''
          : '?';

    return `${trimmedUrl}${separator}${queryString}`;
  }
}

export function buildHeadersObject(headers: ApiFieldPair[]) {
  return Object.fromEntries(
    cleanPairs(headers)
      .filter((pair) => pair.key.trim())
      .map((pair) => [pair.key.trim(), pair.value.trim()]),
  );
}

export function buildFetchSnippet(state: ApiBuilderState) {
  const requestUrl = buildRequestUrl(state.url, state.queryParams);
  const headersObject = buildHeadersObject(state.headers);
  const hasHeaders = Object.keys(headersObject).length > 0;
  const bodyValue = state.body.trim();
  const includeBody = bodyValue.length > 0;

  const optionsLines = [`method: '${normalizeHttpMethod(state.method)}'`];

  if (hasHeaders) {
    optionsLines.push(`headers: ${JSON.stringify(headersObject, null, 2)}`);
  }

  if (includeBody) {
    optionsLines.push(`body: JSON.stringify(${bodyValue})`);
  }

  return `fetch('${requestUrl || 'https://api.example.com'}', {\n  ${optionsLines.join(',\n  ')}\n});`;
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function buildCurlCommand(state: ApiBuilderState) {
  const requestUrl = buildRequestUrl(state.url, state.queryParams);
  const headersObject = buildHeadersObject(state.headers);
  const bodyValue = state.body.trim();
  const commandLines = [
    `curl -X ${normalizeHttpMethod(state.method)} ${shellQuote(requestUrl || 'https://api.example.com')}`,
  ];

  for (const [key, value] of Object.entries(headersObject)) {
    commandLines.push(`-H ${shellQuote(`${key}: ${value}`)}`);
  }

  if (bodyValue.length > 0) {
    commandLines.push(`--data-raw ${shellQuote(bodyValue)}`);
  }

  return commandLines.join(' \\\n  ');
}

export function summarizeRequest(state: ApiBuilderState) {
  return {
    requestUrl: buildRequestUrl(state.url, state.queryParams),
    headers: buildHeadersObject(state.headers),
    hasBody: state.body.trim().length > 0,
  };
}
