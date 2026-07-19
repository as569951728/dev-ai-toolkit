import { useLocalization } from '@/features/localization/localization-context';
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
  const { t } = useLocalization();
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{t('run.prompts.eyebrow')}</p>
          <h2>{t('run.prompts.title')}</h2>
        </div>
        <div className="panel__actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onCopyPrompt('full', formatPromptSections(run))}
          >
            {t('run.prompts.copyFull')}
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
            <h3>{t('run.prompts.system')}</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() => onCopyPrompt('system', run.systemPrompt)}
            >
              {t('run.prompts.copySystem')}
            </button>
          </div>
          <pre className="code-block" tabIndex={0}>{run.systemPrompt}</pre>
        </article>
        <article>
          <div className="detail-card__header">
            <h3>{t('run.prompts.user')}</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() => onCopyPrompt('user', run.userPrompt)}
            >
              {t('run.prompts.copyUser')}
            </button>
          </div>
          <pre className="code-block" tabIndex={0}>{run.userPrompt}</pre>
        </article>
      </div>
    </section>
  );
}
