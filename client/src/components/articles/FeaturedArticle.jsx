import { ArrowRight, Calendar, Clock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPublishedDate, formatReadingTime, getArticlePath, joinAuthorNames } from "../../lib/articlesUi";
import ShareButtons from "./ShareButtons";

function FeaturedCover({ article }) {
  if (!article.coverImageUrl) {
    return (
      <div className="h-full min-h-64 w-full bg-gradient-to-br from-primary/20 via-accent/10 to-slate-100" aria-hidden="true" />
    );
  }

  return (
    <img
      src={article.coverImageUrl}
      alt={`Cover for ${article.title}`}
      className="h-full min-h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
    />
  );
}

export default function FeaturedArticle({ article, fromSearch = "" }) {
  if (!article) {
    return null;
  }

  const articlePath = `${getArticlePath(article.slug)}${fromSearch}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="overflow-hidden">
          <FeaturedCover article={article} />
        </div>

        <div className="flex flex-col p-6 md:p-8">
          <p className="mb-2 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Featured Article
          </p>

          <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">{article.title}</h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">{article.excerpt || "Explore this featured resource from our clinical team."}</p>

          <dl className="mt-4 grid gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <dt className="sr-only">Published</dt>
              <dd>{formatPublishedDate(article.publishedAt)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <dt className="sr-only">Reading time</dt>
              <dd>{formatReadingTime(article.readingTime)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" />
              <dt className="sr-only">Authors</dt>
              <dd>{joinAuthorNames(article.authors)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.slice(0, 4).map((tag) => (
              <span key={tag.slug} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                #{tag.name}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 md:justify-between">
            <Link
              to={articlePath}
              state={{ fromSearch }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Read More
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center">
              <ShareButtons title={article.title} slug={article.slug} compact />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
