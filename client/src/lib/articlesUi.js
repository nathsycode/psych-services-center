export function formatPublishedDate(dateString) {
  if (!dateString) {
    return "Date unavailable";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatReadingTime(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) {
    return "Reading time unavailable";
  }

  return `${Math.round(Number(minutes))} min read`;
}

export function joinAuthorNames(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return "Unknown author";
  }

  return authors.map((author) => author.name).join(", ");
}

export function getArticlePath(slug) {
  return `/articles/${encodeURIComponent(slug)}`;
}
