export interface ApiFieldPair {
  id: string;
  key: string;
  value: string;
}

export type ApiHeaderEntry = [name: string, value: string];

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

function supportsRequestBody(method: string) {
  return !['GET', 'HEAD'].includes(normalizeHttpMethod(method));
}

function isValidJsonBody(body: string) {
  try {
    JSON.parse(body);
    return true;
  } catch {
    return false;
  }
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
        parsedUrl.searchParams.append(pair.key.trim(), pair.value.trim());
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

    const fragmentIndex = trimmedUrl.indexOf('#');
    const urlWithoutFragment =
      fragmentIndex === -1 ? trimmedUrl : trimmedUrl.slice(0, fragmentIndex);
    const fragment =
      fragmentIndex === -1 ? '' : trimmedUrl.slice(fragmentIndex);
    const separator =
      urlWithoutFragment.includes('?') &&
      !urlWithoutFragment.endsWith('?') &&
      !urlWithoutFragment.endsWith('&')
        ? '&'
        : urlWithoutFragment.includes('?')
          ? ''
          : '?';

    return `${urlWithoutFragment}${separator}${queryString}${fragment}`;
  }
}

export function buildHeaderEntries(headers: ApiFieldPair[]): ApiHeaderEntry[] {
  return cleanPairs(headers)
    .filter((pair) => pair.key.trim())
    .map((pair) => [pair.key.trim(), pair.value.trim()]);
}

function buildFetchHeaders(headerEntries: ApiHeaderEntry[]) {
  const seenNames = new Set<string>();
  const hasRepeatedNames = headerEntries.some(([name]) => {
    const normalizedName = name.toLowerCase();
    const isRepeated = seenNames.has(normalizedName);
    seenNames.add(normalizedName);
    return isRepeated;
  });

  return hasRepeatedNames
    ? headerEntries
    : Object.fromEntries(headerEntries);
}

export function buildFetchSnippet(state: ApiBuilderState) {
  const requestUrl = buildRequestUrl(state.url, state.queryParams);
  const headerEntries = buildHeaderEntries(state.headers);
  const hasHeaders = headerEntries.length > 0;
  const bodyValue = state.body.trim();
  const includeBody = bodyValue.length > 0 && supportsRequestBody(state.method);

  const optionsLines = [`method: '${normalizeHttpMethod(state.method)}'`];

  if (hasHeaders) {
    optionsLines.push(
      `headers: ${JSON.stringify(buildFetchHeaders(headerEntries), null, 2)}`,
    );
  }

  if (includeBody) {
    optionsLines.push(`body: ${JSON.stringify(bodyValue)}`);
  }

  const fetchUrl = JSON.stringify(requestUrl || 'https://api.example.com');

  return `fetch(${fetchUrl}, {\n  ${optionsLines.join(',\n  ')}\n});`;
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function buildCurlCommand(state: ApiBuilderState) {
  const requestUrl = buildRequestUrl(state.url, state.queryParams);
  const headerEntries = buildHeaderEntries(state.headers);
  const bodyValue = state.body.trim();
  const includeBody = bodyValue.length > 0 && supportsRequestBody(state.method);
  const commandLines = [
    `curl -X ${normalizeHttpMethod(state.method)} ${shellQuote(requestUrl || 'https://api.example.com')}`,
  ];

  for (const [key, value] of headerEntries) {
    commandLines.push(`-H ${shellQuote(`${key}: ${value}`)}`);
  }

  if (includeBody) {
    commandLines.push(`--data-raw ${shellQuote(bodyValue)}`);
  }

  return commandLines.join(' \\\n  ');
}

export function summarizeRequest(state: ApiBuilderState) {
  const hasBodyInput = state.body.trim().length > 0;
  const bodySupported = supportsRequestBody(state.method);

  return {
    requestUrl: buildRequestUrl(state.url, state.queryParams),
    headerCount: buildHeaderEntries(state.headers).length,
    hasBody: hasBodyInput && bodySupported,
    isBodyOmitted: hasBodyInput && !bodySupported,
    isBodyInvalid:
      hasBodyInput && bodySupported && !isValidJsonBody(state.body),
  };
}
