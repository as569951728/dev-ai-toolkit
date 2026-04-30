import { useState } from 'react';

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

async function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable.');
  }

  await navigator.clipboard.writeText(value);
}

export function JsonToolsPage() {
  const [inputValue, setInputValue] = useState(sampleJson);
  const [resultValue, setResultValue] = useState(sampleJson);
  const [message, setMessage] = useState('Load a sample or paste JSON to begin.');
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
      await copyToClipboard(resultValue);
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

      <section className="panel json-tools-shell">
        <div className="json-tools-shell__header">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Operate on JSON with one focused toolset</h2>
          </div>
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
