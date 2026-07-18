import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import type { PromptPlaygroundVariable } from '@/features/prompt-playground/lib/prompt-playground-utils';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';
import { writeClipboardText } from '@/lib/clipboard';
import { formatPromptSections } from '@/lib/prompt-sections';
import type { PromptTemplate } from '@/types/prompt-template';

interface PromptPlaygroundPreviewProps {
  selectedTemplate: PromptTemplate | null;
  preview:
    | {
        systemPrompt: string;
        userPrompt: string;
      }
    | null;
  onReviewInPromptDiff: () => void;
  onOpenInCodeViewer: () => void;
  onSaveRun: () => void;
  savedRunId: string | null;
  saveStatusMessage: string | null;
  saveStatusTone: 'success' | 'error' | null;
  unresolvedVariables: PromptPlaygroundVariable[];
}

type CopyFeedback = {
  contextKey: string;
  message: string;
  tone: 'success' | 'error';
};

type CopySection = 'system' | 'user' | 'full';

type CopiedSection = {
  contextKey: string;
  section: CopySection;
};

export function PromptPlaygroundPreview({
  selectedTemplate,
  preview,
  onReviewInPromptDiff,
  onOpenInCodeViewer,
  onSaveRun,
  savedRunId,
  saveStatusMessage,
  saveStatusTone,
  unresolvedVariables,
}: PromptPlaygroundPreviewProps) {
  const { language, t } = useLocalization();
  const [copiedSection, setCopiedSection] = useState<CopiedSection | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const copyContextKey = preview ? formatPromptSections(preview) : null;
  const activeCopiedSection =
    copiedSection?.contextKey === copyContextKey ? copiedSection.section : null;
  const activeCopyFeedback =
    copyFeedback?.contextKey === copyContextKey ? copyFeedback : null;

  const handleCopy = async (section: CopySection, value: string) => {
    if (!copyContextKey) {
      return;
    }

    const contextKey = copyContextKey;
    const sectionLabel = t(
      section === 'full'
        ? 'playground.copy.full'
        : section === 'system'
          ? 'playground.copy.system'
          : 'playground.copy.user',
    );

    try {
      await writeClipboardText(value);
      setCopiedSection({ contextKey, section });
      setCopyFeedback({
        contextKey,
        message: t('playground.copy.success', { section: sectionLabel }),
        tone: 'success',
      });

      window.setTimeout(() => {
        setCopiedSection((currentSection) => {
          return currentSection?.contextKey === contextKey &&
            currentSection.section === section
            ? null
            : currentSection;
        });
      }, 1600);
    } catch {
      setCopiedSection(null);
      setCopyFeedback({
        contextKey,
        message: t('playground.copy.error', {
          section:
            language === 'en' ? sectionLabel.toLowerCase() : sectionLabel,
        }),
        tone: 'error',
      });
    }
  };

  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">{t('playground.preview.eyebrow')}</p>
          <h2>{t('playground.preview.title')}</h2>
          <p className="panel__summary">{t('playground.preview.summary')}</p>
          {unresolvedVariables.length > 0 ? (
            <p aria-live="polite" className="run-history-note">
              {t(
                unresolvedVariables.length === 1
                  ? 'playground.preview.unresolved.one'
                  : 'playground.preview.unresolved.other',
                {
                  count: unresolvedVariables.length,
                  labels: unresolvedVariables
                    .map((variable) => variable.label)
                    .join(', '),
                },
              )}
            </p>
          ) : null}
        </div>

        {selectedTemplate && preview ? (
          <div className="panel__actions">
            <button
              className="primary-button"
              disabled={Boolean(savedRunId)}
              type="button"
              onClick={onSaveRun}
            >
              {savedRunId
                ? t('playground.preview.saved')
                : t('playground.preview.save')}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => handleCopy('full', formatPromptSections(preview))}
            >
              {activeCopiedSection === 'full'
                ? t('playground.preview.copiedFull')
                : t('playground.preview.copyFull')}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onReviewInPromptDiff}
            >
              {t('playground.preview.diff')}
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={onOpenInCodeViewer}
            >
              {t('playground.preview.code')}
            </button>
          </div>
        ) : null}
      </div>

      {saveStatusMessage ? (
        <p
          className={
            saveStatusTone === 'error'
              ? 'status-banner status-banner--error'
              : 'status-banner'
          }
          role={saveStatusTone === 'error' ? 'alert' : 'status'}
        >
          <span>{saveStatusMessage}</span>
          {savedRunId ? (
            <span className="status-banner__actions">
              <span>{t('playground.preview.next')}</span>
              <Link to={buildPromptRunDetailPath(savedRunId)}>
                {t('playground.preview.openRun')}
              </Link>
              <Link to="/runs">{t('playground.preview.browseRuns')}</Link>
            </span>
          ) : null}
        </p>
      ) : null}

      {activeCopyFeedback ? (
        <p
          className={
            activeCopyFeedback.tone === 'error'
              ? 'status-banner status-banner--error'
              : 'status-banner'
          }
          role={activeCopyFeedback.tone === 'error' ? 'alert' : 'status'}
        >
          {activeCopyFeedback.message}
        </p>
      ) : null}

      {selectedTemplate && preview ? (
        <div className="preview-stack">
          <article className="detail-card">
            <div className="detail-card__header">
              <h3>{t('playground.preview.system')}</h3>
              <button
                className="ghost-button"
                type="button"
                onClick={() => handleCopy('system', preview.systemPrompt)}
              >
                {activeCopiedSection === 'system'
                  ? t('playground.preview.copied')
                  : t('playground.preview.copy')}
              </button>
            </div>
            <pre className="prompt-preview prompt-text-output">{preview.systemPrompt}</pre>
          </article>

          <article className="detail-card">
            <div className="detail-card__header">
              <h3>{t('playground.preview.user')}</h3>
              <button
                className="ghost-button"
                type="button"
                onClick={() => handleCopy('user', preview.userPrompt)}
              >
                {activeCopiedSection === 'user'
                  ? t('playground.preview.copied')
                  : t('playground.preview.copy')}
              </button>
            </div>
            <pre className="prompt-preview prompt-text-output">{preview.userPrompt}</pre>
          </article>
        </div>
      ) : (
        <div className="empty-state">
          <h2>{t('playground.preview.emptyTitle')}</h2>
          <p>{t('playground.preview.emptyDescription')}</p>
        </div>
      )}
    </section>
  );
}
