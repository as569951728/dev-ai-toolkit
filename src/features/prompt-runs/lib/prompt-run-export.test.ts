import { describe, expect, it } from 'vitest';

import {
  createPromptRunExportFilename,
  createPromptRunExportPayload,
} from '@/features/prompt-runs/lib/prompt-run-export';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplateRevision } from '@/types/prompt-template';

const sampleRun: PromptRunRecord = {
  id: 'run-1',
  templateId: 'template-1',
  templateName: 'API Design Partner',
  templateVersion: 3,
  variables: { endpoint: '/v1/users' },
  systemPrompt: 'You are a practical API design reviewer.',
  userPrompt: 'Review the user endpoint draft.',
  createdAt: '2026-05-07T09:00:00.000Z',
};

const sampleNote: PromptRunNote = {
  id: 'note-1',
  runId: 'run-1',
  body: 'Good baseline for endpoint review.',
  createdAt: '2026-05-08T09:00:00.000Z',
  updatedAt: '2026-05-08T09:00:00.000Z',
};

const sampleSourceTemplateRevision: PromptTemplateRevision = {
  version: 3,
  updatedAt: '2026-05-06T09:00:00.000Z',
  name: 'API Design Partner',
  description: 'Review API endpoint drafts.',
  systemPrompt: 'You are a practical API design reviewer.',
  userPrompt: 'Review {{endpoint}}.',
  tags: ['api'],
};

describe('prompt run export helpers', () => {
  it('creates a stable export payload with run data and note context', () => {
    expect(
      createPromptRunExportPayload({
      run: sampleRun,
      note: sampleNote,
      sourceTemplateRevision: sampleSourceTemplateRevision,
      exportedAt: '2026-05-09T10:00:00.000Z',
    }),
  ).toEqual({
    schemaVersion: 1,
    exportedAt: '2026-05-09T10:00:00.000Z',
    run: sampleRun,
    note: sampleNote,
    sourceTemplateRevision: sampleSourceTemplateRevision,
  });
});

  it('keeps note context nullable when a run has no saved note', () => {
    expect(
      createPromptRunExportPayload({
        run: sampleRun,
        exportedAt: '2026-05-09T10:00:00.000Z',
      }).note,
    ).toBeNull();
  });

  it('keeps source template revision context nullable when it is unavailable', () => {
    expect(
      createPromptRunExportPayload({
        run: sampleRun,
        exportedAt: '2026-05-09T10:00:00.000Z',
      }).sourceTemplateRevision,
    ).toBeNull();
  });

  it('creates a readable JSON filename from the run metadata', () => {
    expect(createPromptRunExportFilename(sampleRun)).toBe(
      '2026-05-07-api-design-partner-run-1.json',
    );
  });
});
