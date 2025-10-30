import { Video, Clipboard, X } from 'lucide-react';
import ServicesData from '../../data/services'

export function ServiceSelection({ selectedService, onServiceChange }) {
  const iconMap = {
    'Video': Video,
    'Clipboard': Clipboard
  }

  return (
    <div className='grid md:grid-cols-2 gap-6 mb-8'>
      {ServicesData.map((service) => {
        const Icon = iconMap[service.icon] || null
        return (
          <div
            className={`relative cursor-pointer rounded-2xl p-8 shadow-lg border-2 transition-all duration-500 ${selectedService === service.shortName
              ? 'border-white shadow-md bg-gradient-to-br from-primary to-accent'
              : 'border-slate-200 bg-white/80 backdrop-blur hover:border-primary'}`}
            onClick={() => onServiceChange(selectedService === service.shortName ? null : service.shortName)}
          >
            <div className='flex items-start justify-between mb-4'>
              <div className={`p-3 rounded-lg ${selectedService === service.shortName ? 'bg-blue-600' : 'bg-blue-100'}`}>
                <Icon />

              </div>
              {service.title}

            </div>
          </div>
        )
      })}
    </div >
  )
}
