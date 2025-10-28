// TODO
// * Add Calendar
// * Fix Visuals

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import servicesData from '../data/services';
import useIO from '../hooks/useIO.js';
import { Video, Clipboard } from 'lucide-react';

export default function Booking() {
  const { ref, isVisible } = useIO(0.1, null);
  const [activated, setActivated] = useState(null);
  const location = useLocation();

  const toggleActivated = (id) => {
    setActivated((prev) => (prev === id ? null : id));
  }

  const iconMap = {
    'Video': Video,
    'Clipboard': Clipboard,
  }

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'consultation') {
      setActivated(1);
    } else if (hash === 'assessment') {
      setActivated(2);
    }
  }, [location]);

  return (
    <section
      ref={ref}
      className="relative h-dvh w-full py-20 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden"
    >
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 mb-16 relative z-10 flex flex-col justify-center">
        <h1 className={`text-4xl md:text-5xl font-bold text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Choose Your Service</h1>
      </div>

      <div className='flex items-stretch justify-center gap-4 h-[600px] max-w-6xl mx-auto w-full'>
        {servicesData.map((service) => {
          const isActive = activated === service.id;
          const Icon = iconMap[service.icon] || null;

          return (
            <div
              key={service.id}
              className={`relative cursor-pointer rounded-2xl p-8 shadow-lg border-2 bg-green-300 transition-all duration-500 ${isActive
                ? 'flex-[3] bg-gradient-to-br from-primary to-accent border-primary'
                : 'flex-[1] bg-white hover:bg-slate-50 border-slate-200 hover:border-primary'}`}
              onClick={() => toggleActivated(service.id)}
            >

              <div className="h-full flex flex-col overflow-y-auto">
                <div className={`mb-4 transition-all duration-300 ${isActive ? 'text-white' : 'text-primary'}`}>
                  <Icon className="w-16 h-16" strokeWidth={0.5} />
                </div>
                <h2>{service.title}</h2>
                <p className={`mb-4 transition-all duration-300 ${isActive ? 'text-white/90' : 'text-slate-600'} ${!isActive && 'text-sm'}`}>
                  {service.shortDesc}
                </p>

              </div>
              {
                isActive && (
                  <div>
                    {/* <iframe src={service.link} frameborder="0" className="border-2 rounded-2xl" /> */}
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
    </section >
  );
}
