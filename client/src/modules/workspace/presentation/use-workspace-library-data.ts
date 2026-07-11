import { useQuery } from '@tanstack/react-query';
import { getCategories, getSnippet, getSnippets, getTags } from '../../snippets/api/snippets-api';

type ViewFilter = 'all' | 'favorites' | 'archived';

export const useWorkspaceLibraryData = ({
  selectedCategory,
  selectedId,
  selectedTag,
  viewFilter,
}: {
  selectedCategory: string[];
  selectedId: string;
  selectedTag: string[];
  viewFilter: ViewFilter;
}) => {
  const snippetsQuery = useQuery({
    queryKey: ['snippets', viewFilter, selectedCategory, selectedTag],
    queryFn: () => getSnippets({
      archived: viewFilter === 'archived' ? true : false,
      favorite: viewFilter === 'favorites' ? true : undefined,
      sort: 'updatedAt',
      direction: 'desc',
    }),
  });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: getTags });
  const snippetQuery = useQuery({
    queryKey: ['snippet', selectedId],
    queryFn: () => getSnippet(selectedId),
    enabled: Boolean(selectedId),
  });

  return { snippetsQuery, categoriesQuery, tagsQuery, snippetQuery };
};
