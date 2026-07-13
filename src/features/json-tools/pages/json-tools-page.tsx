import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { JsonEditorPanel } from '@/features/json-tools/components/json-editor-panel';
import { JsonResultPanel } from '@/features/json-tools/components/json-result-panel';
import { JsonToolsToolbar } from '@/features/json-tools/components/json-tools-toolbar';
import {
  buildJsonErrorMessage,
  countCharacters,
  countLines,
  formatJson,
  minifyJson,
  sampleJson,
  validateJson,
} from '@/features/json-tools/lib/json-tools-utils';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';
import { writeClipboardText } from '@/lib/clipboard';

function createInitialWorkspace(
  requestedRunId: string | null,
  getRunById: ReturnType<typeof usePromptRuns>['getRunById'],
) {
  if (!requestedRunId) {
    return {
      inputValue: sampleJson,
      resultValue: sampleJson,
      message: 'Load a sample or paste JSON to begin.',
      loadNotice: null,
      sourceRunId: null,
    };
  }

  const sourceRun = getRunById(requestedRunId);

  if (!sourceRun) {
    return {
      inputValue: sampleJson,
      resultValue: sampleJson,
      message: 'Load a sample or paste JSON to begin.',
      loadNotice:
        'The requested saved run is no longer available. Loaded the sample JSON instead.',
      sourceRunId: null,
    };
  }

  const variablesJson = JSON.stringify(sourceRun.variables, null, 2);

  return {
    inputValue: variablesJson,
    resultValue: variablesJson,
    message: `Loaded captured variables from ${sourceRun.templateName}.`,
    loadNotice: null,
    sourceRunId: sourceRun.id,
  };
}

export function JsonToolsPage() {
  const [searchParams] = useSearchParams();
  const { getRunById } = usePromptRuns();
  const [initialWorkspace] = useState(() =>
    createInitialWorkspace(searchParams.get('runId'), getRunById),
  );
  const [inputValue, setInputValue] = useState(initialWorkspace.inputValue);
  const [resultValue, setResultValue] = useState(initialWorkspace.resultValue);
  const [message, setMessage] = useState(initialWorkspace.message);
  const [isValid, setIsValid] = useState(true);

  const runAction = (
    action: (rawValue: string) => { content: string; isValid: boolean; message: string },
  ) => {
    try {
      const result = action(inputValue);
      setResultValue(result.content);
      setMessage(result.message);
      setIsValid(result.isValid);
    } catch (error) {
      setResultValue('');
      setMessage(buildJsonErrorMessage(error));
      setIsValid(false);
    }
  };

  const handleCopy = async () => {
    if (!resultValue) {
      return;
    }

    try {
      await writeClipboardText(resultValue);
      setMessage('Result copied to clipboard.');
      setIsValid(true);
    } catch {
      setMessage('Failed to copy result.');
      setIsValid(false);
    }
  };

  return (
    <section className="json-tools-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">JSON Tools</p>
        <h1>Format, validate, and inspect JSON without leaving the workspace.</h1>
        <p className="panel__summary">
          A lightweight utility for AI-adjacent developer tasks like checking
          payloads, cleaning copied responses, and preparing structured data.
        </p>
      </div>

      {initialWorkspace.loadNotice ? (
        <p className="status-banner status-banner--error" role="alert">
          {initialWorkspace.loadNotice}
        </p>
      ) : null}

      <section className="panel json-tools-shell">
        <div className="json-tools-shell__header">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Operate on JSON with one focused toolset</h2>
          </div>
          {initialWorkspace.sourceRunId ? (
            <div className="panel__actions">
              <Link
                className="secondary-button"
                to={buildPromptRunDetailPath(initialWorkspace.sourceRunId)}
              >
                Back to saved run
              </Link>
            </div>
          ) : null}
        </div>

        <JsonToolsToolbar
          onFormat={() => runAction(formatJson)}
          onMinify={() => runAction(minifyJson)}
          onValidate={() => runAction(validateJson)}
          onCopy={handleCopy}
          onLoadSample={() => {
            setInputValue(sampleJson);
            setResultValue(sampleJson);
            setMessage('Loaded sample JSON.');
            setIsValid(true);
          }}
          onReset={() => {
            setInputValue('');
            setResultValue('');
            setMessage('Cleared JSON input and output.');
            setIsValid(true);
          }}
          isCopyDisabled={!resultValue}
        />

        <div className="json-grid">
          <JsonEditorPanel value={inputValue} onChange={setInputValue} />
          <JsonResultPanel
            value={resultValue}
            message={message}
            isValid={isValid}
            inputCharacters={countCharacters(inputValue)}
            inputLines={countLines(inputValue)}
            outputCharacters={countCharacters(resultValue)}
            outputLines={countLines(resultValue)}
          />
        </div>
      </section>
    </section>
  );
}
