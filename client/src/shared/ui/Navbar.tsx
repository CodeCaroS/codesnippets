import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Library' },
  { to: '/snippets/new', label: 'New Snippet' },
  { to: '/import-export', label: 'Import / Export' },
  { to: '/settings', label: 'Settings' },
];

export const Navbar = () => (
  <nav className="navbar">
    <div>
      <h1 className="navbar__title">CodeSnippets</h1>
      <p className="navbar__subtitle">Offline-first code playground</p>
    </div>
    <div className="navbar__links">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) => (isActive ? 'navbar__link navbar__link--active' : 'navbar__link')}
          to={item.to}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  </nav>
);
