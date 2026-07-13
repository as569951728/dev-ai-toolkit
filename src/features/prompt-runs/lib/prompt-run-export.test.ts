import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createPromptRunExportFilename,
  createPromptRunExportPayload,
  exportPromptRunAsJson,
  parsePromptRunExportImport,
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

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('cleans up the temporary download after a failed click', () => {
    const revokeObjectURL = vi.fn();
    const link = document.createElement('a');

    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:prompt-run'),
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.spyOn(document, 'createElement').mockReturnValue(link);
    vi.spyOn(link, 'click').mockImplementation(() => {
      throw new Error('Downloads are unavailable.');
    });

    expect(() => exportPromptRunAsJson({ run: sampleRun })).toThrow(
      'Downloads are unavailable.',
    );
    expect(document.body.contains(link)).toBe(false);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:prompt-run');
  });

  it('parses a single prompt run export payload for import', () => {
    const payload = createPromptRunExportPayload({
      run: sampleRun,
      note: sampleNote,
      sourceTemplateRevision: sampleSourceTemplateRevision,
      exportedAt: '2026-05-09T10:00:00.000Z',
    });

    expect(parsePromptRunExportImport(JSON.stringify(payload))).toEqual(payload);
  });

  it('normalizes imported identifiers without rewriting saved content', () => {
    const parsedPayload = parsePromptRunExportImport(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-05-09T10:00:00.000Z',
        run: {
          ...sampleRun,
          id: ' run-1 ',
          templateId: ' template-1 ',
          templateName: ' API Design Partner ',
          systemPrompt: '  Preserve prompt whitespace.  ',
        },
        note: {
          ...sampleNote,
          id: ' note-1 ',
          runId: ' run-1 ',
          body: '  Preserve note whitespace.  ',
        },
        sourceTemplateRevision: sampleSourceTemplateRevision,
      }),
    );

    expect(parsedPayload.run).toMatchObject({
      id: 'run-1',
      templateId: 'template-1',
      templateName: 'API Design Partner',
      systemPrompt: '  Preserve prompt whitespace.  ',
    });
    expect(parsedPayload.note).toMatchObject({
      id: 'note-1',
      runId: 'run-1',
      body: '  Preserve note whitespace.  ',
    });
  });

  it('rejects malformed prompt run import payloads', () => {
    expect(() => parsePromptRunExportImport('{not-json')).toThrow(
      'Invalid prompt run export format.',
    );

    expect(() =>
      parsePromptRunExportImport(
        JSON.stringify({
          schemaVersion: 1,
          exportedAt: '2026-05-09T10:00:00.000Z',
          run: { ...sampleRun, id: '' },
          note: null,
          sourceTemplateRevision: null,
        }),
      ),
    ).toThrow('Invalid prompt run export format.');

    expect(() =>
      parsePromptRunExportImport(
        JSON.stringify({
          schemaVersion: 1,
          exportedAt: '2026-05-09T10:00:00.000Z',
          run: { ...sampleRun, variables: ['endpoint'] },
          note: null,
          sourceTemplateRevision: null,
        }),
      ),
    ).toThrow('Invalid prompt run export format.');

    expect(() =>
      parsePromptRunExportImport(
        JSON.stringify({
          schemaVersion: 1,
          exportedAt: '2026-05-09T10:00:00.000Z',
          run: sampleRun,
          note: { ...sampleNote, runId: 'other-run' },
          sourceTemplateRevision: null,
        }),
      ),
    ).toThrow('Prompt run note does not match the exported run.');

    expect(() =>
      parsePromptRunExportImport(
        JSON.stringify({
          schemaVersion: 1,
          exportedAt: '2026-05-09T10:00:00.000Z',
          run: { ...sampleRun, templateVersion: 0 },
          note: null,
          sourceTemplateRevision: null,
        }),
      ),
    ).toThrow('Invalid prompt run export format.');

    expect(() =>
      parsePromptRunExportImport(
        JSON.stringify({
          schemaVersion: 1,
          exportedAt: '2026-05-09T10:00:00.000Z',
          run: sampleRun,
          note: null,
          sourceTemplateRevision: {
            ...sampleSourceTemplateRevision,
            version: 1.5,
          },
        }),
      ),
    ).toThrow('Invalid prompt run export format.');

    expect(() =>
      parsePromptRunExportImport(
        JSON.stringify({
          schemaVersion: 1,
          exportedAt: '2026-05-09T10:00:00.000Z',
          run: sampleRun,
          note: null,
          sourceTemplateRevision: {
            ...sampleSourceTemplateRevision,
            version: sampleRun.templateVersion + 1,
          },
        }),
      ),
    ).toThrow('Source template revision does not match the exported run.');
  });
});
