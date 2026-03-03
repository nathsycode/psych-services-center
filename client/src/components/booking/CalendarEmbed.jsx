const PORTFOLIO_DISABLED_MESSAGE =
  "portfolio mode - booking disabled. this website is a demonstration project and does not provide real clinical services. for further detailed demonstration please contact, nathsycode@gmail.com";

export function CalendarEmbed({ serviceData, onLoad, disableInteraction = false }) {
  if (!serviceData) return null;

  const handleLoad = () => {
    if (onLoad) onLoad();
  }

  return (
    <div className="w-full mt-8 flex justify-center">
      <div className="group relative w-full max-w-5xl">
        <iframe
          key={serviceData.link}
          src={serviceData.link}
          onLoad={handleLoad}
          className="w-full h-[900px] rounded-2xl shadow-lg border border-slate-200 transition-all duration-700"
          loading="lazy"
          allowFullScreen
        ></iframe>

        {disableInteraction && (
          <div className="absolute inset-0 z-10 rounded-2xl bg-slate-900/5 backdrop-blur-[1px] transition-all duration-300 ease-out group-hover:bg-slate-900/35 group-hover:backdrop-blur-sm">
            <div className="flex h-full w-full items-center justify-center p-6">
              <p className="max-w-2xl text-center text-xs leading-relaxed text-white/0 transition-colors duration-300 group-hover:text-white sm:text-sm">
                {PORTFOLIO_DISABLED_MESSAGE}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}
