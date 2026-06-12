import { useState } from 'react';
import { Link } from 'react-router-dom';

import { writeClipboardText } from '@/lib/clipboard';
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
}

type CopyFeedback = {
  message: string;
  tone: 'success' | 'error';
};

export function PromptPlaygroundPreview({
  selectedTemplate,
  preview,
  onReviewInPromptDiff,
  onOpenInCodeViewer,
  onSaveRun,
  savedRunId,
  saveStatusMessage,
}: PromptPlaygroundPreviewProps) {
  const [copiedSection, setCopiedSection] = useState<'system' | 'user' | null>(
    null,
  );
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);

  const handleCopy = async (section: 'system' | 'user', value: string) => {
    try {
      await writeClipboardText(value);
      setCopiedSection(section);
      setCopyFeedback({
        message: `${section === 'system' ? 'System' : 'User'} prompt copied.`,
        tone: 'success',
      });

      window.setTimeout(() => {
        setCopiedSection((currentSection) =>
          currentSection === section ? null : currentSection,
        );
      }, 1600);
    } catch {
      setCopiedSection(null);
      setCopyFeedback({
        message: `Failed to copy ${section} prompt.`,
        tone: 'error',
      });
    }
  };

  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Generated prompt output</h2>
          <p className="panel__summary">
            Review the final composed prompt before you copy it into your AI
            workflow.
          </p>
        </div>

        {selectedTemplate && preview ? (
          <div className="panel__actions">
            <button className="primary-button" type="button" onClick={onSaveRun}>
              Save run snapshot
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
        <p className="status-banner" role="status">
          {saveStatusMessage}{' '}
          {savedRunId ? (
            <Link to={`/runs/${savedRunId}`}>Open saved run</Link>
          ) : null}
        </p>
      ) : null}

      {copyFeedback ? (
        <p
          className={
            copyFeedback.tone === 'error'
              ? 'status-banner status-banner--error'
              : 'status-banner'
          }
          role={copyFeedback.tone === 'error' ? 'alert' : 'status'}
        >
          {copyFeedback.message}
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
                {copiedSection === 'system' ? 'Copied' : 'Copy'}
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
                {copiedSection === 'user' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="prompt-preview">{preview.userPrompt}</pre>
          </article>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nothing to preview yet</h2>
          <p>Select a template to see the generated prompt output.</p>
        </div>
      )}
    </section>
  );
}
