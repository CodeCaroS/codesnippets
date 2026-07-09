import type { Snippet } from '@codesnippets/shared';
import clsx from 'clsx';

export const SnippetCard = ({ snippet, onSelect }: { snippet: Snippet; onSelect: (snippetId: string) => void }) => (
  <button className="snippet-card" onClick={() => onSelect(snippet.id)} type="button">
    <div className="snippet-card__header">
      <div>
        <h3>{snippet.title}</h3>
        <p>{snippet.description || 'No description yet.'}</p>
      </div>
      <div className="snippet-card__badges">
        {snippet.favorite ? <span className="badge badge--favorite">★ Favorite</span> : null}
        {snippet.archived ? <span className="badge">Archived</span> : null}
      </div>
    </div>
    <div className="snippet-card__meta">
      <span className={clsx('badge', snippet.category && 'badge--category')}>{snippet.category || 'Uncategorized'}</span>
      <span>{new Date(snippet.updatedAt).toLocaleString()}</span>
    </div>
    <div className="snippet-card__tags">
      {snippet.tags.map((tag) => (
        <span className="tag" key={tag}>
          #{tag}
        </span>
      ))}
    </div>
  </button>
);
