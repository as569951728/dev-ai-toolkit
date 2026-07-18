const workflowFeedbackUrl =
  'https://github.com/as569951728/dev-ai-toolkit/issues/new?template=usage_feedback.yml';
const sourceRepositoryUrl =
  'https://github.com/as569951728/dev-ai-toolkit';

export function AppFooter() {
  const { t } = useLocalization();

  return (
    <footer className="app-footer">
      <p className="app-footer__copy">
        <strong>{t('footer.question')}</strong>
        {t('footer.guidance')}
      </p>
      <div className="app-footer__links">
        <a
          className="app-footer__link app-footer__link--secondary"
          href={sourceRepositoryUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('footer.source')}
        </a>
        <a
          className="app-footer__link"
          href={workflowFeedbackUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('footer.feedback')}
        </a>
      </div>
    </footer>
  );
}
import { useLocalization } from '@/features/localization/localization-context';
