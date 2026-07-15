import { useState } from 'react';
import { NavLink } from 'react-router-dom';

type NavigationItem = {
  to: string;
  label: string;
  end?: boolean;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: 'Start here',
    items: [
      {
        to: '/',
        label: 'Overview',
        end: true,
      },
    ],
  },
  {
    label: 'Prompt Workflows',
    items: [
      {
        to: '/prompts',
        label: 'Prompt Templates',
      },
      {
        to: '/playground',
        label: 'Prompt Playground',
      },
      {
        to: '/runs',
        label: 'Run History',
      },
      {
        to: '/prompt-diff',
        label: 'Prompt Diff',
      },
    ],
  },
  {
    label: 'Developer Utilities',
    items: [
      {
        to: '/json-tools',
        label: 'JSON Tools',
      },
      {
        to: '/api-builder',
        label: 'API Builder',
      },
      {
        to: '/code-viewer',
        label: 'Code Viewer',
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        to: '/workspace',
        label: 'Backup',
      },
    ],
  },
];

export function AppNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="app-nav">
      <div className="app-nav__brand">
        <p className="app-nav__eyebrow">dev-ai-toolkit</p>
        <p className="app-nav__title">Local-first prompt workspace</p>
      </div>

      <button
        type="button"
        className="app-nav__toggle"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        {isMenuOpen ? 'Close navigation' : 'Open navigation'}
      </button>

      <nav
        id="primary-navigation"
        className={
          isMenuOpen
            ? 'app-nav__groups app-nav__groups--open'
            : 'app-nav__groups'
        }
        aria-label="Primary"
      >
        {navigationGroups.map((group) => (
          <div className="app-nav__group" key={group.label}>
            <p className="app-nav__group-label">{group.label}</p>
            <div className="app-nav__links">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </header>
  );
}
