import { describe, expect, it } from 'vitest';

import {
  buildFetchSnippet,
  buildHeadersObject,
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

  it('appends query parameters to relative URLs with existing queries', () => {
    expect(buildRequestUrl('/api/prompts?limit=10', queryParams)).toBe(
      '/api/prompts?limit=10&workspace=dev-ai-toolkit&empty-value=',
    );
  });

  it('builds headers from filled key-value pairs', () => {
    expect(
      buildHeadersObject([
        { id: 'header-1', key: ' Authorization ', value: ' Bearer token ' },
        { id: 'header-2', key: '', value: 'ignored' },
      ]),
    ).toEqual({
      Authorization: 'Bearer token',
    });
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
      "fetch('/api/prompts?workspace=dev-ai-toolkit&empty-value=',",
    );
    expect(summarizeRequest(state)).toEqual({
      requestUrl: '/api/prompts?workspace=dev-ai-toolkit&empty-value=',
      headers: { 'Content-Type': 'application/json' },
      hasBody: true,
    });
  });
});
