import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

const DATE_PRESETS = [
  { key: "all", label: "All time" },
  { key: "30d", label: "Last 30 days" },
  { key: "6m", label: "Last 6 months" },
  { key: "1y", label: "Last year" },
];

function MultiSelectFilter({ label, options, selectedValues, onToggle, onClear, id }) {
  const [optionQuery, setOptionQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalized = optionQuery.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [optionQuery, options]);

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-4" id={id}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span>{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{selectedValues.length} selected</span>
      </summary>

      <div className="mt-3 space-y-3">
        <label htmlFor={`${id}-search`} className="sr-only">
          Search {label}
        </label>
        <input
          id={`${id}-search`}
          type="text"
          value={optionQuery}
          onChange={(event) => setOptionQuery(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}`}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {filteredOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => onToggle(option.value)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-slate-700">{option.label}</span>
              <span className="ml-auto text-xs text-slate-400">{option.count}</span>
            </label>
          ))}
          {filteredOptions.length === 0 && <p className="text-sm text-slate-500">No matches</p>}
        </div>

        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Clear {label.toLowerCase()}
          </button>
        )}
      </div>
    </details>
  );
}

export default function ArticleFilters({
  query,
  onQueryChange,
  datePreset,
  onDatePresetChange,
  tags,
  authors,
  selectedTags,
  selectedAuthors,
  onToggleTag,
  onToggleAuthor,
  onClearTags,
  onClearAuthors,
  onReset,
}) {
  return (
    <section aria-labelledby="article-filters-heading" className="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="article-filters-heading" className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Search and filter
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div>
        <label htmlFor="article-search" className="sr-only">
          Search by title, tags, or authors
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search title, tag, or author"
            className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Date filter presets">
        {DATE_PRESETS.map((preset) => {
          const selected = datePreset === preset.key;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onDatePresetChange(preset.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selected ? "bg-primary text-white" : "border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
              }`}
              aria-pressed={selected}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MultiSelectFilter
          id="tag-filter"
          label="Tags"
          options={tags}
          selectedValues={selectedTags}
          onToggle={onToggleTag}
          onClear={onClearTags}
        />

        <MultiSelectFilter
          id="author-filter"
          label="Authors"
          options={authors}
          selectedValues={selectedAuthors}
          onToggle={onToggleAuthor}
          onClear={onClearAuthors}
        />
      </div>
    </section>
  );
}
