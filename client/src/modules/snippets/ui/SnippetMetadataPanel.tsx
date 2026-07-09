import type { Snippet } from '@codesnippets/shared';
import { Input, Textarea } from '../../../shared/ui/Input';

export type SnippetFormState = Pick<Snippet, 'title' | 'description' | 'category' | 'favorite'> & {
  tags: string[];
};

export const SnippetMetadataPanel = ({
  value,
  onChange,
}: {
  value: SnippetFormState;
  onChange: (next: SnippetFormState) => void;
}) => (
  <aside className="panel stack-md">
    <h3>Metadata</h3>
    <Input
      label="Title"
      value={value.title}
      onChange={(event) => onChange({ ...value, title: event.target.value })}
    />
    <Textarea
      label="Description"
      rows={4}
      value={value.description}
      onChange={(event) => onChange({ ...value, description: event.target.value })}
    />
    <Input
      label="Category"
      value={value.category}
      onChange={(event) => onChange({ ...value, category: event.target.value })}
    />
    <Input
      label="Tags"
      placeholder="comma,separated,tags"
      value={value.tags.join(', ')}
      onChange={(event) =>
        onChange({
          ...value,
          tags: event.target.value
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        })
      }
    />
    <label className="checkbox">
      <input
        checked={value.favorite}
        onChange={(event) => onChange({ ...value, favorite: event.target.checked })}
        type="checkbox"
      />
      Favorite
    </label>
  </aside>
);
