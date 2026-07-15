const workflowFeedbackUrl =
  'https://github.com/as569951728/dev-ai-toolkit/issues/new?template=usage_feedback.yml';

export function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__copy">
        <strong>Used the prompt workflow for a real task?</strong>
        Share what slowed you down without including private prompt content.
      </p>
      <a
        className="app-footer__link"
        href={workflowFeedbackUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Share workflow feedback
      </a>
    </footer>
  );
}
