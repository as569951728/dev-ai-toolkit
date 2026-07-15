import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppNavigation } from './app-navigation';

describe('AppNavigation', () => {
  it('exposes and closes the responsive navigation menu', () => {
    render(
      <MemoryRouter>
        <AppNavigation />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Primary' });
    const openButton = screen.getByRole('button', {
      name: 'Open navigation',
    });

    expect(openButton).toHaveAttribute('aria-controls', navigation.id);
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(navigation).not.toHaveClass('app-nav__groups--open');

    fireEvent.click(openButton);

    const closeButton = screen.getByRole('button', {
      name: 'Close navigation',
    });
    expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    expect(navigation).toHaveClass('app-nav__groups--open');

    fireEvent.click(
      screen.getByRole('link', { name: 'Prompt Templates' }),
    );

    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(navigation).not.toHaveClass('app-nav__groups--open');
  });
});
