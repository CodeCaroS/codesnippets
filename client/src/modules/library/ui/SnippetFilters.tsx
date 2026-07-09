import { Input } from '../../../shared/ui/Input';

export type FilterState = {
  category: string;
  tag: string;
  favoriteOnly: boolean;
  includeArchived: boolean;
};

export const SnippetFilters = ({
  filters,
  categories,
  onChange,
}: {
  filters: FilterState;
  categories: Array<{ id: string; name: string }>;
  onChange: (next: FilterState) => void;
}) => (
  <div className="filters">
    <label className="field">
      <span className="field__label">Category</span>
      <select
        className="input"
        value={filters.category}
        onChange={(event) => onChange({ ...filters, category: event.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
    <Input
      label="Tag"
      placeholder="Filter by tag"
      value={filters.tag}
      onChange={(event) => onChange({ ...filters, tag: event.target.value })}
    />
    <label className="checkbox">
      <input
        checked={filters.favoriteOnly}
        onChange={(event) => onChange({ ...filters, favoriteOnly: event.target.checked })}
        type="checkbox"
      />
      Favorite only
    </label>
    <label className="checkbox">
      <input
        checked={filters.includeArchived}
        onChange={(event) => onChange({ ...filters, includeArchived: event.target.checked })}
        type="checkbox"
      />
      Include archived
    </label>
  </div>
);
