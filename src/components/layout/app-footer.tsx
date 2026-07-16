const workflowFeedbackUrl =
  'https://github.com/as569951728/dev-ai-toolkit/issues/new?template=usage_feedback.yml';
const sourceRepositoryUrl =
  'https://github.com/as569951728/dev-ai-toolkit';

export function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__copy">
        <strong>Used the prompt workflow for a real task?</strong>
        Share what slowed you down without including private prompt content.
      </p>
      <div className="app-footer__links">
        <a
          className="app-footer__link app-footer__link--secondary"
          href={sourceRepositoryUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View source
        </a>
        <a
          className="app-footer__link"
          href={workflowFeedbackUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Share workflow feedback
        </a>
      </div>
    </footer>
  );
}
