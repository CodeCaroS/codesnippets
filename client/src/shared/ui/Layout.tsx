import type { ReactNode } from 'react';
import { Bot, DatabaseBackup, FileCode, Layers, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Workspace Playground', icon: FileCode },
  { to: '/agent-guide', label: 'AI OS Integration Docs', icon: Bot },
  { to: '/settings', label: 'Preferences & Backups', icon: Settings },
  { to: '/import-export', label: 'Database Import Export', icon: DatabaseBackup },
];

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="layout app-shell">
    <nav aria-label="Primary workspace" className="icon-rail">
      <div className="icon-rail__top">
        <div aria-label="CodeSnippets local workspace" className="icon-rail__brand">
          <Layers size={18} />
        </div>
        <div className="icon-rail__divider" />
        <div className="icon-rail__links">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              aria-label={label}
              className={({ isActive }) => (isActive ? 'icon-rail__link icon-rail__link--active' : 'icon-rail__link')}
              key={to}
              title={label}
              to={to}
            >
              <Icon size={18} />
            </NavLink>
          ))}
        </div>
      </div>
      <div className="icon-rail__status">
        <span className="icon-rail__status-light" />
        <span>LOCAL</span>
      </div>
    </nav>
    <main className="layout__content">{children}</main>
  </div>
);
