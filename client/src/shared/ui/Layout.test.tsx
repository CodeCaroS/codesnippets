import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders the reference-style icon rail navigation', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Workspace content</div>
        </Layout>
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Primary workspace' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Workspace Playground' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'AI OS Integration Docs' })).toHaveAttribute('href', '/agent-guide');
    expect(screen.getByRole('link', { name: 'Preferences & Backups' })).toHaveAttribute('href', '/settings');
    expect(screen.getByText('LOCAL')).toBeInTheDocument();
    expect(screen.getByText('Workspace content')).toBeInTheDocument();
  });
});
