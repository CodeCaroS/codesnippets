export type ConsoleEntry = {
  id: string;
  level: 'log' | 'warn' | 'error';
  text: string;
};

export const ConsolePanel = ({ entries, onClear }: { entries: ConsoleEntry[]; onClear: () => void }) => (
  <section className="panel console-panel">
    <div className="console-panel__header">
      <h3>Console</h3>
      <button className="button button--ghost" onClick={onClear} type="button">
        Clear
      </button>
    </div>
    <div className="console-panel__body">
      {entries.length === 0 ? <p className="status">Run code to inspect console output.</p> : null}
      {entries.map((entry) => (
        <pre className={`console-line console-line--${entry.level}`} key={entry.id}>
          [{entry.level}] {entry.text}
        </pre>
      ))}
    </div>
  </section>
);
