import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { NotFoundPage } from '@/features/not-found/pages/not-found-page';

describe('NotFoundPage', () => {
  it('shows a helpful fallback for unknown routes', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'We could not find that page.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Overview' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
