import { useState } from 'react';

import type { PromptTemplate } from '@/types/prompt-template';

interface PromptPlaygroundPreviewProps {
  selectedTemplate: PromptTemplate | null;
  preview:
    | {
        systemPrompt: string;
        userPrompt: string;
      }
    | null;
}

async function copyToClipboard(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    throw new Error('Clipboard API is unavailable.');
  }

  await navigator.clipboard.writeText(value);
}

export function PromptPlaygroundPreview({
  selectedTemplate,
  preview,
}: PromptPlaygroundPreviewProps) {
  const [copiedSection, setCopiedSection] = useState<'system' | 'user' | null>(
    null,
  );

  const handleCopy = async (section: 'system' | 'user', value: string) => {
    try {
      await copyToClipboard(value);
      setCopiedSection(section);

      window.setTimeout(() => {
        setCopiedSection((currentSection) =>
          currentSection === section ? null : currentSection,
        );
      }, 1600);
    } catch {
      setCopiedSection(null);
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
      </div>

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
