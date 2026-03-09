import { useCallback, useEffect, useState } from "react";
import Hero from "../components/home/Hero";
import ServicesSection from "../components/home/ServicesSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import StatsSection from "../components/home/StatsSection";
import CTASection from "../components/home/CTASection";
import { getInitialMode, isPortfolioMode } from "../lib/appMode.js";

// TODO: Why choose us section. Error on card 1.
// TODO: Testimonials - Profile Icons bug.

export default function Home() {
  const [appMode] = useState(getInitialMode());
  const isPortfolio = isPortfolioMode(appMode);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const dismissDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    sessionStorage.setItem("portfolio_disclaimer_seen", "1");
  }, []);

  useEffect(() => {
    if (!isPortfolio) return;
    const alreadySeen =
      sessionStorage.getItem("portfolio_disclaimer_seen") === "1";
    if (!alreadySeen) setShowDisclaimer(true);
  }, [isPortfolio]);

  useEffect(() => {
    if (!showDisclaimer) return;

    const handleScrollDismiss = () => {
      if (window.scrollY > 12) dismissDisclaimer();
    };

    window.addEventListener("scroll", handleScrollDismiss, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollDismiss);
  }, [showDisclaimer, dismissDisclaimer]);

  return (
    <div className="w-full">
      {showDisclaimer && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-2xl border border-white/30 bg-white/25 p-6 text-center shadow-xl backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
                Portfolio Mode
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Demonstration Website
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                This website is a demonstration project and does not provide
                real clinical services.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-200">
                Please visit this link for a video walkthrough:{" "}
                <a
                  href="https://www.youtube.com/playlist?list=PLm9QvqA1_01_PPYLff-U43KSBiC8kR-rP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline decoration-white/70 underline-offset-2 hover:text-white"
                >
                  YouTube playlist
                </a>
                . You may also contact me at{" "}
                <a
                  href="mailto:nathsycode@gmail.com"
                  className="font-medium underline decoration-white/70 underline-offset-2 hover:text-white"
                >
                  nathsycode@gmail.com
                </a>
                .
              </p>
              <p className="mt-2 text-xs text-slate-200">
                Scroll down to dismiss this notice, or continue below.
              </p>
              <button
                onClick={dismissDisclaimer}
                className="mt-5 rounded-full border border-slate-300 bg-white/70 px-5 py-2 text-sm font-medium text-slate-800 transition hover:bg-white"
              >
                Proceed to Site
              </button>
            </div>
          </div>
        </div>
      )}
      <Hero />
      <ServicesSection />
      <WhyChooseUs />
      <Testimonials />
      <StatsSection />
      <CTASection />
    </div>
  );
}
