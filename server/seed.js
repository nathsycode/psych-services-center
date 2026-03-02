import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

// Load JSON files manually
const authors = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/authors.json")),
);

const tags = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/tags.json")),
);

const articles = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/articles.json")),
);

async function seed() {
  console.log("Seeding started...");

  // 1. Upsert authors
  const { error: authorError } = await supabase
    .from("authors")
    .upsert(authors, { onConflict: "slug" });

  if (authorError) throw authorError;

  // 2. Upsert tags
  const { error: tagError } = await supabase
    .from("tags")
    .upsert(tags, { onConflict: "slug" });

  if (tagError) throw tagError;

  // 3. Fetch authors + tags
  const { data: authorRows } = await supabase
    .from("authors")
    .select("id, slug");

  const { data: tagRows } = await supabase.from("tags").select("id, slug");

  const authorMap = Object.fromEntries(authorRows.map((a) => [a.slug, a.id]));

  const tagMap = Object.fromEntries(tagRows.map((t) => [t.slug, t.id]));

  // 4. Upsert articles
  const articleInserts = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    cover_image_url: article.cover_image_url,
    status: article.status,
    reading_time: article.reading_time,
    published_at: article.published_at,
    author_id: authorMap[article.authorSlug],
  }));

  const { error: articleError } = await supabase
    .from("articles")
    .upsert(articleInserts, { onConflict: "slug" });

  if (articleError) throw articleError;

  // 5. Fetch article IDs
  const { data: articleRows } = await supabase
    .from("articles")
    .select("id, slug");

  const articleMap = Object.fromEntries(articleRows.map((a) => [a.slug, a.id]));

  // 6. Build join rows
  const articleTagRows = [];

  for (const article of articles) {
    const articleId = articleMap[article.slug];

    for (const tagSlug of article.tags) {
      articleTagRows.push({
        article_id: articleId,
        tag_id: tagMap[tagSlug],
      });
    }
  }

  const { error: articleTagError } = await supabase
    .from("article_tags")
    .upsert(articleTagRows);

  if (articleTagError) throw articleTagError;

  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
});
