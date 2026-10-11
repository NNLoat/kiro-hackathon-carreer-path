import { useId, useState } from "react";

interface ComboboxProps<T> {
  label: string;
  items: T[];
  selected: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onAdd: (item: T) => void;
  onRemove: (item: T) => void;
  onQueryChange: (q: string) => void;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  testId?: string;
}

// Accessible typeahead multi-select: search input + results listbox + removable chips.
export function Combobox<T>({
  label,
  items,
  selected,
  getId,
  getLabel,
  onAdd,
  onRemove,
  onQueryChange,
  loading,
  error,
  placeholder,
  testId,
}: ComboboxProps<T>) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const listId = useId();
  const selectedIds = new Set(selected.map(getId));
  const results = items.filter((i) => !selectedIds.has(getId(i)));

  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label={`Selected ${label}`}>
          {selected.map((item) => (
            <li key={getId(item)}>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                {getLabel(item)}
                <button
                  type="button"
                  aria-label={`Remove ${getLabel(item)}`}
                  data-testid={testId ? `${testId}-remove-${getId(item)}` : undefined}
                  onClick={() => onRemove(item)}
                  className="rounded-full px-1 text-indigo-600 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        id={inputId}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-invalid={error ? true : undefined}
        value={query}
        placeholder={placeholder}
        data-testid={testId ? `${testId}-input` : undefined}
        onChange={(e) => {
          setQuery(e.target.value);
          onQueryChange(e.target.value);
        }}
        className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      />

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} results`}
          className="max-h-48 overflow-auto rounded-md border border-slate-200"
        >
          {results.map((item) => (
            <li key={getId(item)} role="option" aria-selected={false}>
              <button
                type="button"
                data-testid={testId ? `${testId}-option-${getId(item)}` : undefined}
                onClick={() => {
                  onAdd(item);
                  setQuery("");
                  onQueryChange("");
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
              >
                {getLabel(item)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
