import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Info, Terminal, Trash2 } from 'lucide-react';

export type ConsoleEntry = {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info';
  text: string;
  timestamp?: string;
};

export const ConsolePanel = ({ entries, onClear }: { entries: ConsoleEntry[]; onClear: () => void }) => (
  <ConsolePanelContent entries={entries} onClear={onClear} />
);

const filters = ['all', 'log', 'warn', 'error'] as const;
type ConsoleFilter = (typeof filters)[number];

const ConsolePanelContent = ({ entries, onClear }: { entries: ConsoleEntry[]; onClear: () => void }) => {
  const [filter, setFilter] = useState<ConsoleFilter>('all');
  const [isOpen, setIsOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => filter === 'all' || entry.level === filter),
    [entries, filter],
  );

  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === 'function') {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [filteredEntries.length, isOpen]);

  return (
    <section className="console-panel">
      <div className="console-panel__header">
        <button
          aria-label="Toggle console"
          className="console-panel__title"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <Terminal size={12} />
          <span>Console Logger</span>
          <span className="console-panel__count">{entries.length}</span>
          {isOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
        {isOpen ? (
          <div className="console-panel__actions">
            <div className="console-panel__filters">
              {filters.map((item) => (
                <button
                  className={filter === item ? 'console-panel__filter console-panel__filter--active' : 'console-panel__filter'}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <button aria-label="Clear console" className="console-panel__clear" onClick={onClear} type="button">
              <Trash2 size={12} />
            </button>
          </div>
        ) : null}
      </div>
      {isOpen ? (
        <div aria-label="Console output" className="console-panel__body" role="log">
          {filteredEntries.length === 0 ? (
            <div className="console-panel__empty">Console terminal ready. Output logs appear here.</div>
          ) : (
            filteredEntries.map((entry) => <ConsoleLine entry={entry} key={entry.id} />)
          )}
          <div ref={endRef} />
        </div>
      ) : null}
    </section>
  );
};

const ConsoleLine = ({ entry }: { entry: ConsoleEntry }) => {
  const Icon = entry.level === 'warn' ? AlertTriangle : entry.level === 'error' ? AlertCircle : Info;
  const timestamp = entry.timestamp ? new Date(entry.timestamp) : new Date();

  return (
    <div className={`console-line console-line--${entry.level}`}>
      <Icon size={11} />
      <span className="console-line__time">{timestamp.toLocaleTimeString([], { hour12: false })}</span>
      <span className="console-line__text">{entry.text}</span>
    </div>
  );
};
