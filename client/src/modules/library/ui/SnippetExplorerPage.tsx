import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getSnippets } from '../../snippets/api/snippets-api';
import { SearchBar } from '../../search/ui/SearchBar';
import { Button } from '../../../shared/ui/Button';
import { SnippetFilters, type FilterState } from './SnippetFilters';
import { SnippetList } from './SnippetList';

const defaultFilters: FilterState = {
  category: '',
  tag: '',
  favoriteOnly: false,
  includeArchived: false,
};

export const SnippetExplorerPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const snippetsQuery = useQuery({
    queryKey: ['snippets', filters],
    queryFn: () => getSnippets({
      archived: filters.includeArchived ? undefined : false,
      favorite: filters.favoriteOnly || undefined,
      category: filters.category || undefined,
      tag: filters.tag || undefined,
      sort: 'updatedAt',
      direction: 'desc',
    }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const filteredSnippets = useMemo(() => {
    const items = snippetsQuery.data?.data ?? [];
    if (!search.trim()) {
      return items;
    }

    const query = search.toLowerCase();
    return items.filter((snippet) =>
      [snippet.title, snippet.description, snippet.html, snippet.css, snippet.javascript]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [search, snippetsQuery.data]);

  return (
    <section className="panel stack-lg">
      <div className="page-header">
        <div>
          <h2>Snippet library</h2>
          <p>Browse and reopen saved code playgrounds from your local backend.</p>
        </div>
        <Button onClick={() => navigate('/snippets/new')}>Create snippet</Button>
      </div>

      <SearchBar value={search} onChange={setSearch} />
      <SnippetFilters
        categories={categoriesQuery.data?.data ?? []}
        filters={filters}
        onChange={setFilters}
      />

      {snippetsQuery.isLoading ? <p>Loading snippets…</p> : null}
      {snippetsQuery.error ? <p className="status status--error">{(snippetsQuery.error as Error).message}</p> : null}
      <SnippetList snippets={filteredSnippets} onSelect={(snippetId) => navigate(`/snippets/${snippetId}`)} />
    </section>
  );
};
