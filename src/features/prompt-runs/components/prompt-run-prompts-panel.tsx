import { formatPromptSections } from '@/lib/prompt-sections';
import type { PromptRunRecord } from '@/types/prompt-run';

export type PromptRunCopyTarget = 'system' | 'user' | 'full';

interface PromptRunPromptsPanelProps {
  copyFeedback: {
    message: string;
    tone: 'success' | 'error';
  } | null;
  onCopyPrompt: (target: PromptRunCopyTarget, value: string) => void;
  run: PromptRunRecord;
}

export function PromptRunPromptsPanel({
  copyFeedback,
  onCopyPrompt,
  run,
}: PromptRunPromptsPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Snapshot content</p>
          <h2>Saved prompts</h2>
        </div>
        <div className="panel__actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onCopyPrompt('full', formatPromptSections(run))}
          >
            Copy full prompt
          </button>
        </div>
      </div>

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

      <div className="code-compare-grid">
        <article>
          <div className="detail-card__header">
            <h3>System prompt</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() => onCopyPrompt('system', run.systemPrompt)}
            >
              Copy system prompt
            </button>
          </div>
          <pre className="code-block">{run.systemPrompt}</pre>
        </article>
        <article>
          <div className="detail-card__header">
            <h3>User prompt</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() => onCopyPrompt('user', run.userPrompt)}
            >
              Copy user prompt
            </button>
          </div>
          <pre className="code-block">{run.userPrompt}</pre>
        </article>
      </div>
    </section>
  );
}
