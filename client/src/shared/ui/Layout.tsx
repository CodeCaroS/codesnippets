import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="layout">
    <Navbar />
    <main className="layout__content">{children}</main>
  </div>
);
