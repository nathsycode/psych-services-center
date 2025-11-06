// TODO
// * Add Calendar
// * Fix Visuals

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ServiceSelection } from '../components/booking/ServiceSelection.jsx';
import { CalendarEmbed } from '../components/booking/CalendarEmbed.jsx';
import servicesData from '../data/services';
import useIO from '../hooks/useIO.js';
import { Video, Clipboard } from 'lucide-react';

export default function Booking() {
  const { ref, isVisible } = useIO(0.1, null);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const location = useLocation();
  const [selectedService, setSelectedService] = useState(null);
  const prevService = useRef(null);
  const calendarRef = useRef(null);

  const handleServiceChange = (service) => {
    setSelectedService(prev => (prev === service ? null : service));

  }

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'consultation' || hash === 'assessment') {
      setSelectedService(hash)
    }
  }, [location]);

  useEffect(() => {
    setCalendarLoaded(false);
  }, [selectedService])

  useEffect(() => {
    if (selectedService && prevService.current != selectedService) {
      setTimeout(() => {
        document.getElementById('calendar-section')?.scrollIntoView({ behavior: "smooth", block: 'start' });
      }, 300)
    }

    prevService.current = selectedService;
  }, [selectedService])

  const serviceData = servicesData.find(
    (service) => service.shortName === selectedService
  );

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen px-6 py-24 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden"
    >
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className={`container mx-auto px-4 mb-16 relative z-10 flex flex-col justify-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className={`text-4xl md:text-5xl font-bold text-center mb-4 text-slate-800`}>Choose Your Service</h1>
        <p className='text-center text-slate-600 max-w-2xl mx-auto leading-relaxed' >Book your appointment with our professional mental health team. Choose the service that best fits your needs.</p>
      </div>

      <div className={`w-full max-w-5xl relative z-10 transition-all duration-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        < ServiceSelection
          selectedService={selectedService}
          onServiceChange={handleServiceChange}
        />
      </div>

      {
        selectedService && (
          <div className={`my-12 w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full ${calendarLoaded ? '' : 'animate-pulse'}`}></div>
        )
      }


      <div
        ref={calendarRef}
        id="calendar-section"
        className={`relative w-full flex justify-center transition-all duration-700 ease-in-out ${selectedService ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        style={{
          minHeight: selectedService ? '750px' : '0px',
          overflow: 'hidden'
        }}
      >
        {selectedService && (
          <CalendarEmbed
            serviceData={serviceData}
            onLoad={() => setCalendarLoaded(true)}
          />
        )}

      </div>
    </section >
  );
}
