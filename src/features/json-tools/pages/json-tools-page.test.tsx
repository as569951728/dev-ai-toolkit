import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type InitialEntry,
  MemoryRouter,
  useLocation,
} from 'react-router-dom';

import { sampleJson } from '@/features/json-tools/lib/json-tools-utils';
import { JsonToolsPage } from '@/features/json-tools/pages/json-tools-page';
import { createPromptRunDetailNavigationState } from '@/features/prompt-runs/lib/prompt-run-links';
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
  initialEntry?: InitialEntry;
  runs?: PromptRunRecord[];
} = {}) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PromptRunsProvider repository={createRunRepository(runs)}>
        <JsonToolsPage />
        <LocationStateProbe />
      </PromptRunsProvider>
    </MemoryRouter>,
  );
}

function LocationStateProbe() {
  const location = useLocation();

  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>;
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, 'clipboard');
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
    expect(
      screen.queryByRole('link', { name: 'Back to saved run' }),
    ).not.toBeInTheDocument();

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
    expect(screen.getByText('Not validated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy result' })).toBeDisabled();
  });

  it('invalidates stale output when the input changes', () => {
    renderJsonTools();

    const input = screen.getByLabelText('JSON input');
    fireEvent.change(input, {
      target: { value: '{"value":"first"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Format' }));

    expect(screen.getByText(/"value": "first"/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy result' })).toBeEnabled();

    fireEvent.change(input, {
      target: { value: '{"value":"second"}' },
    });

    expect(screen.getByText('No output yet.')).toBeInTheDocument();
    expect(screen.getByText('Not validated')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Input changed. Run an action to update the result.',
    );
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

    const historyPath = '/runs?templateId=template-1&q=JSON';

    renderJsonTools({
      initialEntry: {
        pathname: '/json-tools',
        search: '?runId=imported%2Frun%20%231',
        state: createPromptRunDetailNavigationState(historyPath),
      },
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
    expect(
      screen.getByRole('link', { name: 'Back to saved run' }),
    ).toHaveAttribute('href', '/runs/imported%2Frun%20%231');

    fireEvent.click(screen.getByRole('link', { name: 'Back to saved run' }));

    expect(screen.getByTestId('location-state')).toHaveTextContent(
      JSON.stringify(createPromptRunDetailNavigationState(historyPath)),
    );
  });

  it('minifies input and restores the sample workspace', () => {
    renderJsonTools();

    const input = screen.getByLabelText('JSON input');
    fireEvent.change(input, {
      target: { value: '{\n  "name": "dev-ai-toolkit"\n}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Minify' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'JSON minified successfully.',
    );
    expect(screen.getByText('{"name":"dev-ai-toolkit"}')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load sample' }));

    expect(input).toHaveValue(sampleJson);
    expect(screen.getByRole('status')).toHaveTextContent('Loaded sample JSON.');
  });

  it('copies the current result and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderJsonTools();

    fireEvent.click(screen.getByRole('button', { name: 'Copy result' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(sampleJson);
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Result copied to clipboard.',
    );
  });

  it('announces copy failures when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    renderJsonTools();

    fireEvent.click(screen.getByRole('button', { name: 'Copy result' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to copy result.',
    );
    expect(screen.getByText('Valid JSON')).toBeInTheDocument();
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
    expect(
      screen.queryByRole('link', { name: 'Back to saved run' }),
    ).not.toBeInTheDocument();
  });
});
