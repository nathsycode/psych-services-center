import { Video, Clipboard, X } from 'lucide-react';
import ServicesData from "../../data/services.json";
import useIO from '../../hooks/useIO'

export function ServiceSelection({ selectedService, onServiceChange }) {
  const { ref, visibleItems } = useIO();

  const iconMap = {
    'Video': Video,
    'Clipboard': Clipboard
  }

  const colorsMap = {
    'consultation': {
      border: 'border-primary',
      text: 'text-primary',
      bg: 'bg-primary/20',
      dot: 'bg-primary',
      hover: 'hover:border-primary/50',
      buttonHover: 'hover:bg-primary/20'
    },
    'assessment': {
      border: 'border-accent',
      text: 'text-accent',
      bg: 'bg-accent/20',
      dot: 'bg-accent',
      hover: 'hover:border-accent/50',
      buttonHover: 'hover:bg-accent/20'
    },
  }

  return (
    <div ref={ref} className='grid md:grid-cols-2 gap-6 mb-8'>
      {ServicesData.map((service) => {
        const Icon = iconMap[service.icon] || null
        const color = colorsMap[service.shortName] || colorsMap.consultation
        const isVisible = visibleItems[service.id];
        const delay = parseInt(service.delay) * 5 + 500

        return (
          <div
            data-item-id={service.id}
            data-delay={delay}
            className={`relative cursor-pointer rounded-2xl p-8 shadow-lg border-2 transition-all duration-500 ${selectedService === service.shortName
              ? `${color.border} shadow-md`
              : `border-slate-200 bg-white/80 backdrop-blur ${color.hover}`}
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
            onClick={() => onServiceChange(selectedService === service.shortName ? null : service.shortName)}
          >
            <div className='flex items-start justify-between mb-4'>
              <div className={`p-3 rounded-lg ${selectedService === service.shortName ? `${color.dot}` : `${color.bg}`}`}>
                <Icon className={`w-6 h-6 transition-colors duration-300 ${selectedService === service.shortName ? 'text-white' : `${color.text}`}`} />
              </div>

              {selectedService === service.shortName && (
                <button
                  type="button"
                  className={`absolute top-4 right-4 flex items-center justify-center rounded-full h-8 w-8 p-0 transition-colors duration-300 ${color.buttonHover}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceChange(null);
                  }}>

                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}

            </div>
            <h3 className={`text-lg transition-all duration-300 transform ${selectedService === service.shortName ? `${color.text}` : 'text-slate-900'
              }`}>
              {service.title}
            </h3>

            <p className="text-sm text-slate-600 mt-2 mb-4">{service.shortDesc}</p>

            <ul className="space-y-2 text-sm text-slate-600">
              {service.features.map((feature) => (
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color.dot}`}></span>
                  {feature}
                </li>

              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-100 w-full">
              <p className="text-sm text-slate-600">{service.duration}</p>
            </div>
          </div>
        )
      })}
    </div >
  )
}
