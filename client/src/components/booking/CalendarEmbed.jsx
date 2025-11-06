
export function CalendarEmbed({ serviceData, onLoad }) {
  if (!serviceData) return null;

  const handleLoad = () => {
    if (onLoad) onLoad();
  }

  return (
    <div className="w-full bg-red mt-8 flex justify-center">
      <iframe
        key={serviceData.link}
        src={serviceData.link}
        onLoad={handleLoad}
        className="w-full max-w-5xl h-[900px] rounded-2xl shadow-lg border border-slate-200 transition-all duration-700"
        loading="lazy"
        allowFullScreen
      ></iframe>
    </div>
  )

}
