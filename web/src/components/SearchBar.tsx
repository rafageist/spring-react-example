interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onSearch, onClear }: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search products by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="btn btn-primary" onClick={onSearch}>
        Search
      </button>
      {value && (
        <button className="btn btn-secondary" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
