import { useEffect, useRef, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

export default function TeamMemberCard({
  member,
  isActive,
  isDimmed,
  onHover,
  onUnhover,
}) {
  const videoRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!videoRef.current) return;
    if (!isActive) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handlePlay = () => {
    if (prefersReducedMotion || !videoRef.current) return;
    videoRef.current.play().catch(() => {});
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
  };

  const handleToggle = () => {
    if (prefersReducedMotion) return;
    if (isActive) {
      onUnhover();
      handlePause();
      return;
    }
    onHover();
    handlePlay();
  };

  return (
    <article
      className={`group relative grid gap-6 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 md:grid-cols-[minmax(0,360px)_1fr] ${
        isDimmed ? "blur-sm opacity-50" : "opacity-100"
      }`}
      onMouseEnter={() => {
        onHover();
        handlePlay();
      }}
      onMouseLeave={() => {
        onUnhover();
        handlePause();
      }}
      onFocus={() => {
        onHover();
        handlePlay();
      }}
      onBlur={() => {
        onUnhover();
        handlePause();
      }}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
      role="button"
      aria-pressed={isActive}
      aria-label={`Toggle ${member.name} introduction video`}
      tabIndex={0}
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-900/5">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={`/videos/${member.videoName}`}
          poster={`/videos/thumbnails/${member.videoName.replace(".mp4", ".jpg")}`}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`${member.name} introduction video`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-slate-900/10 to-transparent" />
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
          {member.name}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-slate-900">
            {member.name}
          </h3>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {member.role}
          </p>
          <p className="text-sm text-slate-500">
            {member.profession} · {member.title}
          </p>
        </div>
        <p className="text-base leading-relaxed text-slate-600">
          {member.description}
        </p>
      </div>
    </article>
  );
}
