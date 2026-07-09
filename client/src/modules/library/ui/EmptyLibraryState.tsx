import { Link } from 'react-router-dom';
export const EmptyLibraryState = () => (
  <div className="empty-state">
    <h2>No snippets yet</h2>
    <p>Create your first offline snippet and start experimenting.</p>
    <Link className="button button--primary" to="/snippets/new">
      Create Snippet
    </Link>
  </div>
);
