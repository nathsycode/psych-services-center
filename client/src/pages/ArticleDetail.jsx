import { lazy, Suspense, useEffect, useState } from "react";
import { Calendar, ChevronLeft, Clock, UserRound } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import ShareButtons from "../components/articles/ShareButtons";
import { getArticleBySlug } from "../lib/articlesApi";
import { formatPublishedDate, formatReadingTime, getArticlePath, joinAuthorNames } from "../lib/articlesUi";

const MarkdownContent = lazy(() => import("../components/common/MarkdownContent.jsx"));

export default function ArticleDetail() {
  const { slug } = useParams();
  const location = useLocation();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!slug) {
      setStatus("missing");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setStatus("loading");

      try {
        const data = await getArticleBySlug(decodeURIComponent(slug));

        if (!data) {
          setStatus("missing");
          setArticle(null);
        } else {
          setArticle(data);
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const backSearch = location.state?.fromSearch || "";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="h-8 w-44 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-6 h-10 w-3/4 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Article not found</h1>
          <p className="mt-2 text-slate-600">This article may have moved or no longer exists.</p>
          <Link
            to={`/articles${backSearch}`}
            className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          We couldn&apos;t load this article. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <article className="container mx-auto max-w-4xl space-y-8 px-4 py-12 md:py-16">
      <Link
        to={`/articles${backSearch}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      <header className="space-y-4">
        <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">{article.title}</h1>

        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <div className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <dt className="sr-only">Published</dt>
            <dd>{formatPublishedDate(article.publishedAt)}</dd>
          </div>
          <div className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <dt className="sr-only">Reading time</dt>
            <dd>{formatReadingTime(article.readingTime)}</dd>
          </div>
          <div className="inline-flex items-center gap-2">
            <UserRound className="h-4 w-4 text-primary" />
            <dt className="sr-only">Authors</dt>
            <dd>{joinAuthorNames(article.authors)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag.slug} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              #{tag.name}
            </span>
          ))}
        </div>

        <ShareButtons title={article.title} slug={article.slug} />
      </header>

      {article.coverImageUrl ? (
        <img
          src={article.coverImageUrl}
          alt={`Cover for ${article.title}`}
          className="w-full rounded-3xl border border-slate-200 object-cover"
        />
      ) : (
        <div className="h-72 w-full rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-slate-100" aria-hidden="true" />
      )}

      <section
        className="article-content rounded-3xl border border-slate-200 bg-white p-6 md:p-8"
        aria-label="Article content"
      >
        {article.content ? (
          <Suspense fallback={<p className="text-slate-600">Loading content...</p>}>
            <MarkdownContent content={article.content} />
          </Suspense>
        ) : (
          <p>This article does not have body content yet.</p>
        )}
      </section>

      <footer className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Found this useful? Share it with someone who might need it.</p>
        <div className="mt-3">
          <ShareButtons title={article.title} slug={article.slug} />
        </div>
        <Link
          to={getArticlePath(article.slug)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        >
          Permalink
        </Link>
      </footer>
    </article>
  );
}
