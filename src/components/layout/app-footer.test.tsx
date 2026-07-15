import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppFooter } from '@/components/layout/app-footer';

describe('AppFooter', () => {
  it('links safely to the workflow form and warns about private content', () => {
    render(<AppFooter />);

    expect(
      screen.getByText(/without including private prompt content/i),
    ).toBeInTheDocument();

    const feedbackLink = screen.getByRole('link', {
      name: 'Share workflow feedback',
    });

    expect(feedbackLink).toHaveAttribute(
      'href',
      'https://github.com/as569951728/dev-ai-toolkit/issues/new?template=usage_feedback.yml',
    );
    expect(feedbackLink).toHaveAttribute('target', '_blank');
    expect(feedbackLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
