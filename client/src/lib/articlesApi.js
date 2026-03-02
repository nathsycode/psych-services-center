import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    return [value];
  }

  return [];
}

function normalizeAuthors(rawAuthors) {
  return toArray(rawAuthors)
    .map((author) => ({
      name: author?.name?.trim() || "Unknown author",
      title: author?.title?.trim() || "",
    }))
    .filter((author, index, authors) => {
      const key = `${author.name}:${author.title}`;
      return authors.findIndex((item) => `${item.name}:${item.title}` === key) === index;
    });
}

function normalizeTags(rawArticleTags) {
  return toArray(rawArticleTags)
    .map((articleTag) => {
      const tag = Array.isArray(articleTag?.tags) ? articleTag.tags[0] : articleTag?.tags;
      if (!tag) {
        return null;
      }

      return {
        name: tag?.name?.trim() || "",
        slug: tag?.slug?.trim() || tag?.name?.trim()?.toLowerCase().replace(/\s+/g, "-") || "",
      };
    })
    .filter((tag) => tag && tag.name)
    .filter((tag, index, tags) => tags.findIndex((item) => item.slug === tag.slug) === index);
}

export function normalizeArticle(rawArticle) {
  const authors = normalizeAuthors(rawArticle?.authors);
  const tags = normalizeTags(rawArticle?.article_tags);

  return {
    id: rawArticle?.id,
    title: rawArticle?.title?.trim() || "Untitled article",
    slug: rawArticle?.slug?.trim() || "",
    excerpt: rawArticle?.excerpt?.trim() || "",
    content: rawArticle?.content || "",
    coverImageUrl: rawArticle?.cover_image_url || "",
    publishedAt: rawArticle?.published_at || null,
    readingTime: Number(rawArticle?.reading_time) || null,
    authors,
    tags,
    searchableTags: tags.map((tag) => tag.name),
    searchableAuthors: authors.map((author) => author.name),
  };
}

export async function getArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, cover_image_url, published_at, reading_time, authors ( name, title ), article_tags ( tags ( name, slug ) )",
    )
    .order("published_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return toArray(data).map(normalizeArticle);
}

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, content, cover_image_url, published_at, reading_time, authors ( name, title ), article_tags ( tags ( name, slug ) )",
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return normalizeArticle(data);
}
