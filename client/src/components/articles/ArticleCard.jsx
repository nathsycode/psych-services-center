import { Calendar, Clock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPublishedDate, formatReadingTime, getArticlePath, joinAuthorNames } from "../../lib/articlesUi";

function CoverImage({ src, alt }) {
  if (!src) {
    return (
      <div className="h-48 w-full bg-gradient-to-br from-primary/20 via-accent/10 to-slate-100" aria-hidden="true" />
    );
  }

  return <img src={src} alt={alt} className="h-48 w-full object-cover" loading="lazy" />;
}

export default function ArticleCard({ article, fromSearch = "" }) {
  const articlePath = `${getArticlePath(article.slug)}${fromSearch}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CoverImage src={article.coverImageUrl} alt={`Cover for ${article.title}`} />

      <div className="flex h-full flex-col p-5">
        <h3 className="text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-primary">
          <Link to={articlePath} state={{ fromSearch }} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {article.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">{article.excerpt || "No excerpt available yet."}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag.slug} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              #{tag.name}
            </span>
          ))}
        </div>

        <dl className="mt-4 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <dt className="sr-only">Published</dt>
            <dd>{formatPublishedDate(article.publishedAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <dt className="sr-only">Reading time</dt>
            <dd>{formatReadingTime(article.readingTime)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            <dt className="sr-only">Authors</dt>
            <dd>{joinAuthorNames(article.authors)}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <Link
            to={articlePath}
            state={{ fromSearch }}
            className="inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Read Article
          </Link>
        </div>
      </div>
    </article>
  );
}
