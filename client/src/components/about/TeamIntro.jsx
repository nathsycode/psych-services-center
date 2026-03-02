import { useEffect, useRef, useState } from "react";
import useIO from "../../hooks/useIO";
import { Brain, History } from "lucide-react";

const timelineEvents = [
  {
    year: "2017",
    description:
      "What began as a small counseling space grew out of a belief that early, affordable support can change the course of a person’s life. MindCare Center opened its doors with a single therapy room and a commitment to evidence-based care.",
  },
  {
    year: "2019",
    description:
      "The team expanded to include psychiatric services and structured treatment programs for anxiety and mood disorders. This marked the beginning of a more integrated, multidisciplinary approach to mental healthcare.",
  },
  {
    year: "2022",
    description:
      "Recognizing the growing need for accessible care, MindCare launched secure teletherapy services and digital intake systems, allowing clients to receive support beyond geographic limitations.",
  },
  {
    year: "Today",
    description:
      "MindCare Center continues to refine its programs using data-informed practices and outcome tracking, while maintaining the same core mission: compassionate, modern mental healthcare that meets people where they are.",
  },
];

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

export default function TeamIntro() {
  const { ref, visibleItems } = useIO();
  const prefersReducedMotion = usePrefersReducedMotion();
  const introVideoRef = useRef(null);
  const introWrapRef = useRef(null);
  const [isIntroInView, setIsIntroInView] = useState(false);

  useEffect(() => {
    if (!introWrapRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntroInView(entry.intersectionRatio >= 0.3);
      },
      { threshold: [0, 0.3, 0.6, 1] },
    );

    observer.observe(introWrapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = introVideoRef.current;
    if (!video) return;
    if (prefersReducedMotion || !isIntroInView) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [prefersReducedMotion, isIntroInView]);

  return (
    <section
      ref={ref}
      className="container mx-auto flex max-w-6xl flex-col gap-16 py-24 text-center"
    >
      <div className="flex flex-col items-center gap-6">
        <h1
          data-item-id="1"
          data-delay="100"
          className={`text-display text-slate-900 transition-all duration-700 ${
            visibleItems["1"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          Meet Our Team
        </h1>
        <Brain
          className={`h-6 w-6 text-primary transition-all duration-700 ${
            visibleItems["1"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        />
        <p
          className={`mx-auto max-w-3xl text-body-lg text-slate-600 transition-all duration-700 ${
            visibleItems["1"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          We’re a collective of licensed psychologists, counselors, and
          psychometricians united by one mission: to make mental health care
          compassionate, accessible, and grounded in evidence. We believe every
          story deserves to be heard and that healing happens when science meets
          empathy.
        </p>
      </div>

      <div
        ref={introWrapRef}
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        tabIndex={0}
        aria-label="Intro video container"
      >
        <video
          ref={introVideoRef}
          className="h-full w-full object-cover"
          src="/videos/intro.mp4"
          poster="/videos/thumbnails/intro.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="MindCare Center introduction video"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-900/50 via-slate-900/15 to-transparent" />
        <div className="pointer-events-none absolute bottom-6 left-6 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
          A Brief Introduction
        </div>
      </div>

      <div className="flex flex-col gap-10 text-left">
        <div
          data-item-id="2"
          data-delay="250"
          className={`rounded-3xl border border-slate-100 bg-white/70 p-10 shadow-sm transition-all duration-700 ${
            visibleItems["2"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3">
            <History strokeWidth="1.25" className="h-6 w-6 text-slate-700" />
            <h2 className="text-heading text-slate-900">Our Origin Story</h2>
          </div>
          <div className="relative mt-8 pl-6">
            <div className="absolute left-2 top-2 h-full w-px bg-slate-200" />
            <div className="space-y-8">
              {timelineEvents.map((timeline) => {
                return (
                  <div
                    key={`timeline-${timeline.year}`}
                    id={`timeline-${timeline.year}`}
                    className="relative"
                  >
                    <span className="absolute -left-[30px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-white shadow-sm" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {timeline.year}
                    </p>
                    <p className="mt-3 text-base text-slate-600">
                      {timeline.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          data-item-id="3"
          data-delay="500"
          className={`rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-sky-50 to-white p-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] transition-all duration-700 ${
            visibleItems["3"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
            Mission
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            A grounded commitment to care.
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            To provide accessible, ethical, and personalized psychological
            services that empower individuals and communities toward mental
            wellness.
          </p>
        </div>

        <div
          data-item-id="4"
          data-delay="900"
          className={`rounded-3xl border border-accent/20 bg-gradient-to-br from-white via-amber-50 to-white p-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] transition-all duration-700 ${
            visibleItems["4"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">
            Vision
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            A future where mental health is foundational.
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            A society where mental health is valued as an essential part of
            human flourishing.
          </p>
        </div>
      </div>
    </section>
  );
}
