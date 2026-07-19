import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import type { TranslationKey } from '@/features/localization/translations';
import { JsonEditorPanel } from '@/features/json-tools/components/json-editor-panel';
import {
  JsonResultPanel,
  type JsonMessageTone,
  type JsonValidationState,
} from '@/features/json-tools/components/json-result-panel';
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
import {
  buildPromptRunDetailPath,
  createPromptRunDetailNavigationState,
  getPromptRunHistoryReturnPath,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { writeClipboardText } from '@/lib/clipboard';

function createInitialWorkspace(
  requestedRunId: string | null,
  getRunById: ReturnType<typeof usePromptRuns>['getRunById'],
  t: ReturnType<typeof useLocalization>['t'],
) {
  if (!requestedRunId) {
    return {
      inputValue: sampleJson,
      resultValue: sampleJson,
      message: t('json.message.idle'),
      loadNotice: null,
      sourceRunId: null,
    };
  }

  const sourceRun = getRunById(requestedRunId);

  if (!sourceRun) {
    return {
      inputValue: sampleJson,
      resultValue: sampleJson,
      message: t('json.message.idle'),
      loadNotice: t('json.message.runMissing'),
      sourceRunId: null,
    };
  }

  const variablesJson = JSON.stringify(sourceRun.variables, null, 2);

  return {
    inputValue: variablesJson,
    resultValue: variablesJson,
    message: t('json.message.runLoaded', { name: sourceRun.templateName }),
    loadNotice: null,
    sourceRunId: sourceRun.id,
  };
}

export function JsonToolsPage() {
  const { t } = useLocalization();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getRunById } = usePromptRuns();
  const [initialWorkspace] = useState(() =>
    createInitialWorkspace(searchParams.get('runId'), getRunById, t),
  );
  const [inputValue, setInputValue] = useState(initialWorkspace.inputValue);
  const [resultValue, setResultValue] = useState(initialWorkspace.resultValue);
  const [message, setMessage] = useState(initialWorkspace.message);
  const [validationState, setValidationState] =
    useState<JsonValidationState>('valid');
  const [messageTone, setMessageTone] =
    useState<JsonMessageTone>('status');
  const historyPath = getPromptRunHistoryReturnPath(location.state);

  const runAction = (
    action: (rawValue: string) => { content: string; isValid: boolean; message: string },
    successMessageKey: TranslationKey,
  ) => {
    try {
      const result = action(inputValue);
      setResultValue(result.content);
      setMessage(t(successMessageKey));
      setValidationState(result.isValid ? 'valid' : 'invalid');
      setMessageTone(result.isValid ? 'status' : 'error');
    } catch (error) {
      setResultValue('');
      setMessage(buildJsonErrorMessage(error));
      setValidationState('invalid');
      setMessageTone('error');
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setResultValue('');
    setMessage(t('json.message.changed'));
    setValidationState('idle');
    setMessageTone('status');
  };

  const handleCopy = async () => {
    if (!resultValue) {
      return;
    }

    try {
      await writeClipboardText(resultValue);
      setMessage(t('json.message.copied'));
      setMessageTone('status');
    } catch {
      setMessage(t('json.message.copyError'));
      setMessageTone('error');
    }
  };

  return (
    <section className="json-tools-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">{t('json.hero.eyebrow')}</p>
        <h1>{t('json.hero.title')}</h1>
        <p className="panel__summary">{t('json.hero.summary')}</p>
      </div>

      {initialWorkspace.loadNotice ? (
        <p className="status-banner status-banner--error" role="alert">
          {initialWorkspace.loadNotice}
        </p>
      ) : null}

      <section className="panel json-tools-shell">
        <div className="json-tools-shell__header">
          <div>
            <p className="eyebrow">{t('json.workflow.eyebrow')}</p>
            <h2>{t('json.workflow.title')}</h2>
          </div>
          {initialWorkspace.sourceRunId ? (
            <div className="panel__actions">
              <Link
                className="secondary-button"
                state={createPromptRunDetailNavigationState(historyPath)}
                to={buildPromptRunDetailPath(initialWorkspace.sourceRunId)}
              >
                {t('json.workflow.back')}
              </Link>
            </div>
          ) : null}
        </div>

        <JsonToolsToolbar
          onFormat={() => runAction(formatJson, 'json.message.formatted')}
          onMinify={() => runAction(minifyJson, 'json.message.minified')}
          onValidate={() => runAction(validateJson, 'json.message.valid')}
          onCopy={handleCopy}
          onLoadSample={() => {
            setInputValue(sampleJson);
            setResultValue(sampleJson);
            setMessage(t('json.message.sample'));
            setValidationState('valid');
            setMessageTone('status');
          }}
          onReset={() => {
            setInputValue('');
            setResultValue('');
            setMessage(t('json.message.reset'));
            setValidationState('idle');
            setMessageTone('status');
          }}
          isCopyDisabled={!resultValue}
        />

        <div className="json-grid">
          <JsonEditorPanel value={inputValue} onChange={handleInputChange} />
          <JsonResultPanel
            value={resultValue}
            message={message}
            validationState={validationState}
            messageTone={messageTone}
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
