import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../lib/cn";

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
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const listId = useId();
  const selectedIds = new Set(selected.map(getId));
  const results = items.filter((i) => !selectedIds.has(getId(i)));
  const showList = open && (results.length > 0 || loading);

  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label={`Selected ${label}`}>
          {selected.map((item) => (
            <li key={getId(item)}>
              <span className="chip bg-brand-100 text-brand-800">
                {getLabel(item)}
                <button
                  type="button"
                  aria-label={`Remove ${getLabel(item)}`}
                  data-testid={testId ? `${testId}-remove-${getId(item)}` : undefined}
                  onClick={() => onRemove(item)}
                  className="rounded-full p-0.5 text-brand-600 hover:bg-brand-200"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-invalid={error ? true : undefined}
          value={query}
          placeholder={placeholder}
          data-testid={testId ? `${testId}-input` : undefined}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            setQuery(e.target.value);
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        {showList ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={`${label} results`}
            className="card absolute z-10 mt-1 max-h-56 w-full overflow-auto p-1"
          >
            {loading ? <li className="px-3 py-2 text-sm text-slate-500">Loading…</li> : null}
            {!loading && results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
            ) : null}
            {results.map((item) => (
              <li key={getId(item)} role="option" aria-selected={false}>
                <button
                  type="button"
                  data-testid={testId ? `${testId}-option-${getId(item)}` : undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onAdd(item);
                    setQuery("");
                    onQueryChange("");
                  }}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm text-slate-700",
                    "hover:bg-brand-50 focus:bg-brand-50 focus:outline-none",
                  )}
                >
                  {getLabel(item)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
