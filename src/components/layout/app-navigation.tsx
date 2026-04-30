import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    to: '/playground',
    label: 'Prompt Playground',
  },
  {
    to: '/prompts',
    label: 'Prompt Templates',
  },
];

export function AppNavigation() {
  return (
    <header className="app-nav">
      <div>
        <p className="app-nav__eyebrow">dev-ai-toolkit</p>
        <h1 className="app-nav__title">AI developer workspace</h1>
      </div>

      <nav className="app-nav__links" aria-label="Primary">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
