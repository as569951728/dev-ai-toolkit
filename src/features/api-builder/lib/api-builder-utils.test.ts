import { describe, expect, it } from 'vitest';

import {
  buildCurlCommand,
  buildFetchSnippet,
  buildHeaderEntries,
  buildRequestUrl,
  summarizeRequest,
  type ApiBuilderState,
} from '@/features/api-builder/lib/api-builder-utils';

const queryParams = [
  { id: 'query-1', key: 'workspace', value: 'dev-ai-toolkit' },
  { id: 'query-2', key: 'empty-value', value: '' },
  { id: 'query-3', key: '', value: 'ignored' },
];

describe('api-builder-utils', () => {
  it('builds absolute request URLs with query parameters', () => {
    expect(
      buildRequestUrl('https://api.example.com/v1/prompts', queryParams),
    ).toBe('https://api.example.com/v1/prompts?workspace=dev-ai-toolkit&empty-value=');
  });

  it('preserves repeated query parameters in absolute URLs', () => {
    expect(
      buildRequestUrl(
        'https://api.example.com/v1/items?limit=10#results',
        [
          { id: 'query-1', key: 'tag', value: 'alpha' },
          { id: 'query-2', key: 'tag', value: 'beta' },
        ],
      ),
    ).toBe(
      'https://api.example.com/v1/items?limit=10&tag=alpha&tag=beta#results',
    );
  });

  it('appends query parameters to relative URLs with existing queries', () => {
    expect(buildRequestUrl('/api/prompts?limit=10', queryParams)).toBe(
      '/api/prompts?limit=10&workspace=dev-ai-toolkit&empty-value=',
    );
  });

  it('inserts relative URL query parameters before fragments', () => {
    expect(buildRequestUrl('/api/prompts#debug', queryParams)).toBe(
      '/api/prompts?workspace=dev-ai-toolkit&empty-value=#debug',
    );
    expect(buildRequestUrl('/api/prompts?limit=10#debug', queryParams)).toBe(
      '/api/prompts?limit=10&workspace=dev-ai-toolkit&empty-value=#debug',
    );
  });

  it('builds header entries from filled key-value pairs', () => {
    expect(
      buildHeaderEntries([
        { id: 'header-1', key: ' Authorization ', value: ' Bearer token ' },
        { id: 'header-2', key: '', value: 'ignored' },
      ]),
    ).toEqual([['Authorization', 'Bearer token']]);
  });

  it('builds a fetch snippet and request summary', () => {
    const state: ApiBuilderState = {
      method: 'POST',
      url: '/api/prompts',
      queryParams,
      headers: [{ id: 'header-1', key: 'Content-Type', value: 'application/json' }],
      body: '{ "name": "Code Review Assistant" }',
    };

    expect(buildFetchSnippet(state)).toContain(
      'fetch("/api/prompts?workspace=dev-ai-toolkit&empty-value=",',
    );
    expect(summarizeRequest(state)).toEqual({
      requestUrl: '/api/prompts?workspace=dev-ai-toolkit&empty-value=',
      headerCount: 1,
      hasBody: true,
      isBodyOmitted: false,
      isBodyInvalid: false,
    });
  });

  it('preserves repeated headers in fetch and curl output', () => {
    const state: ApiBuilderState = {
      method: 'GET',
      url: '/api/prompts',
      queryParams: [],
      headers: [
        { id: 'header-1', key: 'X-Trace', value: 'first' },
        { id: 'header-2', key: 'x-trace', value: 'second' },
      ],
      body: '',
    };

    const fetchSnippet = buildFetchSnippet(state);
    const curlCommand = buildCurlCommand(state);

    expect(fetchSnippet).toContain('"X-Trace"');
    expect(fetchSnippet).toContain('"first"');
    expect(fetchSnippet).toContain('"x-trace"');
    expect(fetchSnippet).toContain('"second"');
    expect(() => new Function(fetchSnippet)).not.toThrow();
    expect(curlCommand).toContain("-H 'X-Trace: first'");
    expect(curlCommand).toContain("-H 'x-trace: second'");
    expect(summarizeRequest(state).headerCount).toBe(2);
  });

  it('escapes apostrophes in generated fetch URLs', () => {
    const state: ApiBuilderState = {
      method: 'GET',
      url: "https://api.example.com/users/O'Reilly",
      queryParams: [],
      headers: [],
      body: '',
    };

    const fetchSnippet = buildFetchSnippet(state);

    expect(fetchSnippet).toContain(
      'fetch("https://api.example.com/users/O\'Reilly",',
    );
    expect(() => new Function(fetchSnippet)).not.toThrow();
  });

  it('keeps fetch snippets valid when the JSON body is malformed', () => {
    const state: ApiBuilderState = {
      method: 'POST',
      url: '/api/prompts',
      queryParams: [],
      headers: [
        {
          id: 'header-1',
          key: 'Content-Type',
          value: 'application/json',
        },
      ],
      body: '{bad-json',
    };

    const fetchSnippet = buildFetchSnippet(state);

    expect(fetchSnippet).toContain('body: "{bad-json"');
    expect(() => new Function(fetchSnippet)).not.toThrow();
    expect(summarizeRequest(state)).toEqual({
      requestUrl: '/api/prompts',
      headerCount: 1,
      hasBody: true,
      isBodyOmitted: false,
      isBodyInvalid: true,
    });
  });

  it('omits request bodies from generated GET requests', () => {
    const state: ApiBuilderState = {
      method: 'GET',
      url: '/api/prompts',
      queryParams: [],
      headers: [],
      body: '{ "name": "Code Review Assistant" }',
    };

    expect(buildFetchSnippet(state)).not.toContain('body:');
    expect(buildCurlCommand(state)).not.toContain('--data-raw');
    expect(summarizeRequest(state)).toEqual({
      requestUrl: '/api/prompts',
      headerCount: 0,
      hasBody: false,
      isBodyOmitted: true,
      isBodyInvalid: false,
    });
  });

  it('normalizes HTTP methods in generated snippets', () => {
    const state: ApiBuilderState = {
      method: ' post ',
      url: '/api/prompts',
      queryParams: [],
      headers: [],
      body: '',
    };

    expect(buildFetchSnippet(state)).toContain("method: 'POST'");
    expect(buildCurlCommand(state)).toContain('curl -X POST');
  });

  it('falls back to GET when the request method is blank', () => {
    const state: ApiBuilderState = {
      method: '   ',
      url: '/api/prompts',
      queryParams: [],
      headers: [],
      body: '',
    };

    expect(buildFetchSnippet(state)).toContain("method: 'GET'");
    expect(buildCurlCommand(state)).toContain('curl -X GET');
  });

  it('builds a curl command from the request draft', () => {
    const state: ApiBuilderState = {
      method: 'POST',
      url: '/api/prompts',
      queryParams,
      headers: [
        { id: 'header-1', key: 'Content-Type', value: 'application/json' },
        { id: 'header-2', key: 'X-Owner', value: "Dev's Toolkit" },
      ],
      body: '{ "name": "Code Review Assistant" }',
    };

    expect(buildCurlCommand(state)).toBe(
      "curl -X POST '/api/prompts?workspace=dev-ai-toolkit&empty-value=' \\\n" +
        "  -H 'Content-Type: application/json' \\\n" +
        "  -H 'X-Owner: Dev'\\''s Toolkit' \\\n" +
        `  --data-raw '{ "name": "Code Review Assistant" }'`,
    );
  });
});
