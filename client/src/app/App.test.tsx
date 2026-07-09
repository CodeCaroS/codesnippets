import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EmptyLibraryState } from '../modules/library/ui/EmptyLibraryState';

describe('EmptyLibraryState', () => {
  it('renders a call to action', () => {
    render(
      <MemoryRouter>
        <EmptyLibraryState />
      </MemoryRouter>,
    );

    expect(screen.getByText('No snippets yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Snippet' })).toHaveAttribute('href', '/snippets/new');
  });
});
