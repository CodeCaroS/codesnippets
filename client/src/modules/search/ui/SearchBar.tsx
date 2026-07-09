import { Input } from '../../../shared/ui/Input';

export const SearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <Input
    label="Search"
    placeholder="Search title, description, or code"
    value={value}
    onChange={(event) => onChange(event.target.value)}
  />
);
