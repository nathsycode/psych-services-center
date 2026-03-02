import { useMemo, useState } from "react";
import { Check, Copy, Facebook, Instagram, Share2, Twitter } from "lucide-react";

function buildArticleUrl(slug) {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/articles/${encodeURIComponent(slug)}`;
}

async function copyToClipboard(text) {
  if (!text) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default function ShareButtons({ title, slug, compact = false }) {
  const [status, setStatus] = useState("");
  const articleUrl = useMemo(() => buildArticleUrl(slug), [slug]);

  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  const xUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const buttonClass = compact
    ? "inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    : "inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const setTemporaryStatus = (nextStatus) => {
    setStatus(nextStatus);
    window.setTimeout(() => setStatus(""), 1800);
  };

  const handleNativeShare = async () => {
    if (!articleUrl) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: articleUrl,
        });
        return;
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error(error);
        }
      }
    }

    const copied = await copyToClipboard(articleUrl);
    setTemporaryStatus(copied ? "Link copied" : "Copy failed");
  };

  const handleCopy = async () => {
    const copied = await copyToClipboard(articleUrl);
    setTemporaryStatus(copied ? "Link copied" : "Copy failed");
  };

  const handleInstagram = async () => {
    const copied = await copyToClipboard(articleUrl);
    setTemporaryStatus(copied ? "Link copied for Instagram" : "Copy link, then paste in Instagram");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <div aria-label="Share article">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleNativeShare} className={buttonClass} aria-label="Share article">
          <Share2 className="h-4 w-4" />
          {!compact && <span>Share</span>}
        </button>

        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Share on X"
        >
          <Twitter className="h-4 w-4" />
          {!compact && <span>X</span>}
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
          {!compact && <span>Facebook</span>}
        </a>

        <button
          type="button"
          onClick={handleInstagram}
          className={buttonClass}
          aria-label="Share on Instagram"
        >
          <Instagram className="h-4 w-4" />
          {!compact && <span>Instagram</span>}
        </button>

        <button type="button" onClick={handleCopy} className={buttonClass} aria-label="Copy article link">
          {status.startsWith("Link copied") ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {!compact && <span>Copy Link</span>}
        </button>
      </div>

      {compact ? (
        <span className="sr-only" aria-live="polite">
          {status}
        </span>
      ) : (
        <p className="min-h-5 pt-2 text-xs text-slate-500" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
