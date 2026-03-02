import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Fuse from "fuse.js";
import ArticleCard from "../components/articles/ArticleCard";
import ArticleFilters from "../components/articles/ArticleFilters";
import FeaturedArticle from "../components/articles/FeaturedArticle";
import { getArticles } from "../lib/articlesApi";

const DEFAULT_VISIBLE_COUNT = 5;
const DATE_PRESETS = new Set(["all", "30d", "6m", "1y"]);

function parseListParam(value) {
  if (!value) {
    return [];
  }

  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function serializeListParam(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "";
  }

  return values.join("|");
}

function isWithinDatePreset(dateString, preset) {
  if (!dateString || preset === "all") {
    return true;
  }

  const published = new Date(dateString);
  if (Number.isNaN(published.getTime())) {
    return false;
  }

  const now = new Date();
  const threshold = new Date(now);

  if (preset === "30d") {
    threshold.setDate(now.getDate() - 30);
  } else if (preset === "6m") {
    threshold.setMonth(now.getMonth() - 6);
  } else if (preset === "1y") {
    threshold.setFullYear(now.getFullYear() - 1);
  }

  return published >= threshold;
}

function toggleValue(setter, value) {
  setter((current) => {
    if (current.includes(value)) {
      return current.filter((entry) => entry !== value);
    }

    return [...current, value];
  });
}

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [selectedTags, setSelectedTags] = useState(() => parseListParam(searchParams.get("tags")));
  const [selectedAuthors, setSelectedAuthors] = useState(() => parseListParam(searchParams.get("authors")));
  const [datePreset, setDatePreset] = useState(() => {
    const value = searchParams.get("date") || "all";
    return DATE_PRESETS.has(value) ? value : "all";
  });
  const [visibleCount, setVisibleCount] = useState(() => {
    const value = Number(searchParams.get("limit"));
    if (Number.isFinite(value) && value > DEFAULT_VISIBLE_COUNT) {
      return Math.round(value);
    }

    return DEFAULT_VISIBLE_COUNT;
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getArticles();
        setArticles(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load articles right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (query.trim()) {
      nextParams.set("q", query.trim());
    }

    if (selectedTags.length > 0) {
      nextParams.set("tags", serializeListParam(selectedTags));
    }

    if (selectedAuthors.length > 0) {
      nextParams.set("authors", serializeListParam(selectedAuthors));
    }

    if (datePreset !== "all") {
      nextParams.set("date", datePreset);
    }

    if (visibleCount > DEFAULT_VISIBLE_COUNT) {
      nextParams.set("limit", String(visibleCount));
    }

    setSearchParams(nextParams, { replace: true });
  }, [datePreset, query, selectedAuthors, selectedTags, setSearchParams, visibleCount]);

  const tagOptions = useMemo(() => {
    const counts = new Map();

    for (const article of articles) {
      for (const tag of article.tags) {
        const existing = counts.get(tag.slug);
        if (!existing) {
          counts.set(tag.slug, { value: tag.slug, label: tag.name, count: 1 });
        } else {
          existing.count += 1;
        }
      }
    }

    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [articles]);

  const authorOptions = useMemo(() => {
    const counts = new Map();

    for (const article of articles) {
      for (const author of article.authors) {
        const existing = counts.get(author.name);
        if (!existing) {
          counts.set(author.name, { value: author.name, label: author.name, count: 1 });
        } else {
          existing.count += 1;
        }
      }
    }

    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const byFilters = articles.filter((article) => {
      const tagMatch =
        selectedTags.length === 0 || article.tags.some((tag) => selectedTags.includes(tag.slug));

      const authorMatch =
        selectedAuthors.length === 0 || article.authors.some((author) => selectedAuthors.includes(author.name));

      const dateMatch = isWithinDatePreset(article.publishedAt, datePreset);

      return tagMatch && authorMatch && dateMatch;
    });

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return byFilters;
    }

    const fuse = new Fuse(byFilters, {
      includeScore: true,
      threshold: 0.5,
      ignoreLocation: true,
      distance: 120,
      findAllMatches: true,
      minMatchCharLength: 2,
      keys: [
        { name: "title", weight: 0.55 },
        { name: "searchableTags", weight: 0.25 },
        { name: "searchableAuthors", weight: 0.2 },
      ],
    });

    return fuse.search(normalizedQuery).map((result) => result.item);
  }, [articles, datePreset, query, selectedAuthors, selectedTags]);

  const featuredArticle = filteredArticles[0] || null;
  const regularArticles = filteredArticles.slice(1);
  const visibleArticles = regularArticles.slice(0, visibleCount);
  const hasMoreArticles = regularArticles.length > visibleArticles.length;

  const fromSearch = location.search;

  const resetFilters = () => {
    setQuery("");
    setSelectedTags([]);
    setSelectedAuthors([]);
    setDatePreset("all");
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-8 h-72 animate-pulse rounded-3xl bg-slate-200" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />

      <section className="container relative mx-auto space-y-8 px-4 py-12 md:py-16">
        <header className="max-w-3xl space-y-3">
          <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Resources
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Articles & Resources</h1>
          <p className="text-base leading-relaxed text-slate-600 md:text-lg">
            Explore evidence-informed mental health guidance from our clinicians and contributors.
          </p>
        </header>

        <ArticleFilters
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setVisibleCount(DEFAULT_VISIBLE_COUNT);
          }}
          datePreset={datePreset}
          onDatePresetChange={(value) => {
            setDatePreset(value);
            setVisibleCount(DEFAULT_VISIBLE_COUNT);
          }}
          tags={tagOptions}
          authors={authorOptions}
          selectedTags={selectedTags}
          selectedAuthors={selectedAuthors}
          onToggleTag={(tag) => {
            toggleValue(setSelectedTags, tag);
            setVisibleCount(DEFAULT_VISIBLE_COUNT);
          }}
          onToggleAuthor={(author) => {
            toggleValue(setSelectedAuthors, author);
            setVisibleCount(DEFAULT_VISIBLE_COUNT);
          }}
          onClearTags={() => {
            setSelectedTags([]);
            setVisibleCount(DEFAULT_VISIBLE_COUNT);
          }}
          onClearAuthors={() => {
            setSelectedAuthors([]);
            setVisibleCount(DEFAULT_VISIBLE_COUNT);
          }}
          onReset={resetFilters}
        />

        <p className="text-sm text-slate-500" aria-live="polite">
          {filteredArticles.length} article{filteredArticles.length === 1 ? "" : "s"} found
        </p>

        {featuredArticle ? (
          <FeaturedArticle article={featuredArticle} fromSearch={fromSearch} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700">No matching articles found.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
            >
              Reset filters
            </button>
          </div>
        )}

        {visibleArticles.length > 0 && (
          <section aria-labelledby="article-list-heading" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 id="article-list-heading" className="text-2xl font-bold text-slate-900">
                More to read
              </h2>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-accent"
              >
                Need support?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.id} article={article} fromSearch={fromSearch} />
              ))}
            </div>
          </section>
        )}

        {hasMoreArticles && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + DEFAULT_VISIBLE_COUNT)}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Load More Articles
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
