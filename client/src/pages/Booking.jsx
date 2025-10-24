// TODO
// * Add Calendar
// * Fix Visuals

import { useState } from 'react';
import servicesData from '../data/services';
import useIO from '../hooks/useIO.js';
import { Video, Clipboard } from 'lucide-react';

export default function Booking() {
  const { ref, isVisible } = useIO(0.1, null);
  const [activated, setActivated] = useState(null);

  const toggleActivated = (id) => {
    setActivated((prev) => (prev === id ? 0 : id));
  }

  const iconMap = {
    'Video': Video,
    'Clipboard': Clipboard,
  }

  return (
    <section
      ref={ref}
      className="relative container h-dvh w-full flex flex-col items-center justify-center mx-auto px-4 py-16"
    >
      <h1 className={`text-4xl font-bold text-center mb-8 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Book Your Session</h1>
      <div className='flex items-center justify-center w-full gap-2 bg-yellow-100'>
        {servicesData.map((service) => {
          const isActive = activated === service.id;
          const Icon = iconMap[service.icon];

          return (
            <div
              key={service.id}
              className={`cursor-pointer bg-green-300 flex flex-col items-center justify-center mx-2 p-4 transition-all duration-500 ${isActive ? 'flex-[2] bg-blue-400' : 'flex[1] bg-blue-200 hover:bg-slate-300'}`}
              onClick={() => toggleActivated(service.id)}
            >
              <Icon className="w-8 h-8" strokeWidth={1.5} />
              <h2>{service.title}</h2>
              {isActive && (
                <div>
                  <p className="text-center text-slate-600">{service.fullDesc}</p>
                  <ul>
                    {service.features.map((feature, idx) => (
                      <li key={idx}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
              }
            </div>
          )
        })}
      </div>
    </section>
  );
}
