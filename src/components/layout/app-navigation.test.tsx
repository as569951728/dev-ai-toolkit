import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { LocalizationProvider } from '@/features/localization/localization-provider';

import { AppNavigation } from './app-navigation';

afterEach(() => {
  window.localStorage.removeItem('dev-ai-toolkit.language');
});

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

  it('switches the navigation to Chinese and remembers the choice', async () => {
    render(
      <LocalizationProvider initialLanguage="en">
        <MemoryRouter>
          <AppNavigation />
        </MemoryRouter>
      </LocalizationProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '中文' }));

    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prompt 模板' })).toBeInTheDocument();
    expect(window.localStorage.getItem('dev-ai-toolkit.language')).toBe('zh-CN');
    await waitFor(() => {
      expect(document.documentElement.lang).toBe('zh-CN');
    });
  });
});
