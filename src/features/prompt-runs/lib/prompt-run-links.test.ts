import { describe, expect, it } from 'vitest';

import {
  buildPromptRunDetailPath,
  buildPromptRunPlaygroundPath,
  buildPromptRunSourceDiffUrl,
  buildPromptTemplateCreateFromRunPath,
} from '@/features/prompt-runs/lib/prompt-run-links';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

const template: PromptTemplate = {
  id: 'review-template',
  name: 'Review Template',
  description: 'Review code changes.',
  systemPrompt: 'Current system prompt v2.',
  userPrompt: 'Current user prompt v2.',
  tags: ['review'],
  version: 2,
  revisions: [
    {
      version: 1,
      updatedAt: '2026-05-06T09:00:00.000Z',
      name: 'Review Template',
      description: 'Review code changes.',
      systemPrompt: 'Original system prompt v1.',
      userPrompt: 'Original user prompt v1.',
      tags: ['review'],
    },
    {
      version: 2,
      updatedAt: '2026-05-07T09:00:00.000Z',
      name: 'Review Template',
      description: 'Review code changes.',
      systemPrompt: 'Current system prompt v2.',
      userPrompt: 'Current user prompt v2.',
      tags: ['review'],
    },
  ],
  archivedAt: null,
  updatedAt: '2026-05-07T09:00:00.000Z',
};

const run: PromptRunRecord = {
  id: 'run-1',
  templateId: template.id,
  templateName: template.name,
  templateVersion: 1,
  variables: {},
  systemPrompt: 'Generated system prompt.',
  userPrompt: 'Generated user prompt.',
  createdAt: '2026-05-08T09:00:00.000Z',
};

describe('prompt-run-links', () => {
  it('encodes a run ID as one URL path segment', () => {
    expect(buildPromptRunDetailPath('imported/run #1')).toBe(
      '/runs/imported%2Frun%20%231',
    );
    expect(buildPromptRunDetailPath('run-1')).toBe('/runs/run-1');
  });

  it('builds a template create path from a saved run ID', () => {
    expect(buildPromptTemplateCreateFromRunPath('imported/run #1')).toBe(
      '/prompts/new?runId=imported%2Frun%20%231',
    );
    expect(buildPromptTemplateCreateFromRunPath('run-1')).toBe(
      '/prompts/new?runId=run-1',
    );
  });

  it('encodes run and template IDs used to reopen a saved run', () => {
    expect(
      buildPromptRunPlaygroundPath({
        runId: 'imported/run #1',
        templateId: 'imported/template & #1',
      }),
    ).toBe(
      '/playground?runId=imported%2Frun%20%231&templateId=imported%2Ftemplate%20%26%20%231',
    );
    expect(
      buildPromptRunPlaygroundPath({
        runId: 'run-1',
        templateId: 'template-1',
      }),
    ).toBe('/playground?runId=run-1&templateId=template-1');
  });

  it('builds a Prompt Diff URL using the matching source template revision', () => {
    const url = new URL(
      buildPromptRunSourceDiffUrl({ run, sourceTemplate: template }) ?? '',
      'https://example.test',
    );

    expect(url.pathname).toBe('/prompt-diff');
    expect(url.searchParams.get('left')).toBe(
      'Original system prompt v1.\n\nOriginal user prompt v1.',
    );
    expect(url.searchParams.get('right')).toBe(
      'Generated system prompt.\n\nGenerated user prompt.',
    );
  });

  it('returns null when the source template is missing', () => {
    expect(
      buildPromptRunSourceDiffUrl({ run, sourceTemplate: undefined }),
    ).toBeNull();
    expect(
      buildPromptRunSourceDiffUrl({ run, sourceTemplate: null }),
    ).toBeNull();
  });

  it('returns null when the matching source revision is missing', () => {
    expect(
      buildPromptRunSourceDiffUrl({
        run,
        sourceTemplate: {
          ...template,
          revisions: template.revisions.filter(
            (revision) => revision.version !== run.templateVersion,
          ),
        },
      }),
    ).toBeNull();
  });
});
