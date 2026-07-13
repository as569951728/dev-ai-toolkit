import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { JsonToolsPage } from '@/features/json-tools/pages/json-tools-page';
import { PromptRunsProvider } from '@/features/prompt-runs/providers/prompt-runs-provider';
import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

function createRunRepository(runs: PromptRunRecord[]): PromptRunRepository {
  return {
    loadAll: () => [...runs],
    saveAll: () => undefined,
  };
}

function renderJsonTools({
  initialEntry = '/json-tools',
  runs = [],
}: {
  initialEntry?: string;
  runs?: PromptRunRecord[];
} = {}) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptRunsProvider repository={createRunRepository(runs)}>
        <JsonToolsPage />
      </PromptRunsProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe('JsonToolsPage', () => {
  it('formats, validates, and resets JSON input', () => {
    renderJsonTools();

    const input = screen.getByLabelText('JSON input');

    fireEvent.change(input, {
      target: { value: '{"name":"dev-ai-toolkit"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Format' }));

    expect(screen.getByText('JSON formatted successfully.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'JSON formatted successfully.',
    );
    expect(screen.getByText(/"name": "dev-ai-toolkit"/)).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: '{bad-json' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid JSON');
    expect(screen.getByText('No output yet.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(
      screen.getByText('Cleared JSON input and output.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy result' })).toBeDisabled();
  });

  it('loads captured variables from a saved prompt run', () => {
    const run: PromptRunRecord = {
      id: 'imported/run #1',
      templateId: 'template-1',
      templateName: 'Code Review Assistant',
      templateVersion: 1,
      variables: {
        repository_name: 'dev-ai-toolkit',
        change_scope: 'JSON workflow',
      },
      systemPrompt: 'System prompt.',
      userPrompt: 'User prompt.',
      createdAt: '2026-07-13T08:00:00.000Z',
    };
    const variablesJson = JSON.stringify(run.variables, null, 2);

    renderJsonTools({
      initialEntry: '/json-tools?runId=imported%2Frun%20%231',
      runs: [run],
    });

    expect(screen.getByLabelText('JSON input')).toHaveValue(variablesJson);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loaded captured variables from Code Review Assistant.',
    );
    expect(
      screen.getAllByText(/"repository_name": "dev-ai-toolkit"/),
    ).toHaveLength(2);
    expect(
      screen.getAllByText(/"change_scope": "JSON workflow"/),
    ).toHaveLength(2);
  });

  it('keeps the sample workflow available when a requested run is missing', () => {
    renderJsonTools({ initialEntry: '/json-tools?runId=missing-run' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The requested saved run is no longer available.',
    );
    expect(
      (screen.getByLabelText('JSON input') as HTMLTextAreaElement).value,
    ).toContain('"module": "json-tools"');
    expect(screen.getByText('Valid JSON')).toBeInTheDocument();
  });
});
