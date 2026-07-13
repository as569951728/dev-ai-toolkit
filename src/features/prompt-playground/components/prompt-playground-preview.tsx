import { useState } from 'react';
import { Link } from 'react-router-dom';

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
    const sectionLabel =
      section === 'full'
        ? 'Full prompt'
        : `${section === 'system' ? 'System' : 'User'} prompt`;

    try {
      await writeClipboardText(value);
      setCopiedSection({ contextKey, section });
      setCopyFeedback({
        contextKey,
        message: `${sectionLabel} copied.`,
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
        message: `Failed to copy ${sectionLabel.toLowerCase()}.`,
        tone: 'error',
      });
    }
  };

  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Composed prompt preview</h2>
          <p className="panel__summary">
            Review the final composed prompt before you copy it into your AI
            workflow.
          </p>
          {unresolvedVariables.length > 0 ? (
            <p aria-live="polite" className="run-history-note">
              {unresolvedVariables.length}{' '}
              {unresolvedVariables.length === 1
                ? 'template variable is unresolved. Its placeholder'
                : 'template variables are unresolved. Their placeholders'}{' '}
              will remain in copied and saved prompts. Missing:{' '}
              {unresolvedVariables
                .map((variable) => variable.label)
                .join(', ')}
              .
            </p>
          ) : null}
        </div>

        {selectedTemplate && preview ? (
          <div className="panel__actions">
            <button className="primary-button" type="button" onClick={onSaveRun}>
              Save prompt snapshot
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => handleCopy('full', formatPromptSections(preview))}
            >
              {activeCopiedSection === 'full'
                ? 'Copied full prompt'
                : 'Copy full prompt'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onReviewInPromptDiff}
            >
              Review in Prompt Diff
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={onOpenInCodeViewer}
            >
              Open in Code Viewer
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
              <span>Next: review it, add a note, or browse history.</span>
              <Link to={buildPromptRunDetailPath(savedRunId)}>
                Open saved run
              </Link>
              <Link to="/runs">Browse run history</Link>
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
              <h3>System prompt</h3>
              <button
                className="ghost-button"
                type="button"
                onClick={() => handleCopy('system', preview.systemPrompt)}
              >
                {activeCopiedSection === 'system' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="prompt-preview">{preview.systemPrompt}</pre>
          </article>

          <article className="detail-card">
            <div className="detail-card__header">
              <h3>User prompt</h3>
              <button
                className="ghost-button"
                type="button"
                onClick={() => handleCopy('user', preview.userPrompt)}
              >
                {activeCopiedSection === 'user' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="prompt-preview">{preview.userPrompt}</pre>
          </article>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nothing to preview yet</h2>
          <p>Select a template to preview the composed prompts.</p>
        </div>
      )}
    </section>
  );
}
