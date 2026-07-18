import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { LanguageSwitcher } from '@/features/localization/components/language-switcher';
import { useLocalization } from '@/features/localization/localization-context';
import type { TranslationKey } from '@/features/localization/translations';

type NavigationItem = {
  to: string;
  labelKey: TranslationKey;
  end?: boolean;
};

type NavigationGroup = {
  labelKey: TranslationKey;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    labelKey: 'navigation.group.start',
    items: [
      {
        to: '/',
        labelKey: 'navigation.overview',
        end: true,
      },
    ],
  },
  {
    labelKey: 'navigation.group.prompts',
    items: [
      {
        to: '/prompts',
        labelKey: 'navigation.templates',
      },
      {
        to: '/playground',
        labelKey: 'navigation.playground',
      },
      {
        to: '/runs',
        labelKey: 'navigation.runs',
      },
      {
        to: '/prompt-diff',
        labelKey: 'navigation.diff',
      },
    ],
  },
  {
    labelKey: 'navigation.group.utilities',
    items: [
      {
        to: '/json-tools',
        labelKey: 'navigation.json',
      },
      {
        to: '/api-builder',
        labelKey: 'navigation.api',
      },
      {
        to: '/code-viewer',
        labelKey: 'navigation.code',
      },
    ],
  },
  {
    labelKey: 'navigation.group.workspace',
    items: [
      {
        to: '/workspace',
        labelKey: 'navigation.backup',
      },
    ],
  },
];

export function AppNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLocalization();

  const closeMenu = () => {
    const shouldRestoreFocus = isMenuOpen;

    setIsMenuOpen(false);

    if (shouldRestoreFocus) {
      window.requestAnimationFrame(() => {
        document.getElementById('main-content')?.focus();
      });
    }
  };

  return (
    <header className="app-nav">
      <div className="app-nav__brand">
        <p className="app-nav__eyebrow">dev-ai-toolkit</p>
        <p className="app-nav__title">{t('app.tagline')}</p>
        <LanguageSwitcher />
      </div>

      <button
        type="button"
        className="app-nav__toggle"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        {isMenuOpen ? t('navigation.close') : t('navigation.open')}
      </button>

      <nav
        id="primary-navigation"
        className={
          isMenuOpen
            ? 'app-nav__groups app-nav__groups--open'
            : 'app-nav__groups'
        }
        aria-label={t('navigation.primary')}
      >
        {navigationGroups.map((group) => (
          <div className="app-nav__group" key={group.labelKey}>
            <p className="app-nav__group-label">{t(group.labelKey)}</p>
            <div className="app-nav__links">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </header>
  );
}
