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
];

export function AppNavigation() {
  return (
    <header className="app-nav">
      <div>
        <p className="app-nav__eyebrow">dev-ai-toolkit</p>
        <h1 className="app-nav__title">AI developer toolbox</h1>
      </div>

      <nav className="app-nav__groups" aria-label="Primary">
        {navigationGroups.map((group) => (
          <div className="app-nav__group" key={group.label}>
            <p className="app-nav__group-label">{group.label}</p>
            <div className="app-nav__links">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
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
