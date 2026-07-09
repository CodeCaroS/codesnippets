import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConsolePanel, type ConsoleEntry } from './ConsolePanel';

const entries: ConsoleEntry[] = [
  { id: '1', level: 'log', text: 'loaded' },
  { id: '2', level: 'warn', text: 'careful' },
  { id: '3', level: 'error', text: 'failed' },
];

describe('ConsolePanel', () => {
  it('filters console output and can collapse like the reference console', () => {
    render(<ConsolePanel entries={entries} onClear={vi.fn()} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'warn' }));

    const output = screen.getByRole('log', { name: 'Console output' });
    expect(within(output).getByText(/careful/)).toBeInTheDocument();
    expect(within(output).queryByText(/loaded/)).not.toBeInTheDocument();
    expect(within(output).queryByText(/failed/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle console' }));

    expect(screen.queryByRole('log', { name: 'Console output' })).not.toBeInTheDocument();
  });
});
