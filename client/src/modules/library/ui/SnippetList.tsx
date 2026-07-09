import type { Snippet } from '@codesnippets/shared';
import { EmptyLibraryState } from './EmptyLibraryState';
import { SnippetCard } from './SnippetCard';

export const SnippetList = ({ snippets, onSelect }: { snippets: Snippet[]; onSelect: (snippetId: string) => void }) => {
  if (snippets.length === 0) {
    return <EmptyLibraryState />;
  }

  return (
    <div className="snippet-list">
      {snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} onSelect={onSelect} />
      ))}
    </div>
  );
};
