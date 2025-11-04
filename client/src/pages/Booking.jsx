// TODO
// * Add Calendar
// * Fix Visuals

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ServiceSelection } from '../components/booking/ServiceSelection.jsx';
import servicesData from '../data/services';
import useIO from '../hooks/useIO.js';
import { Video, Clipboard } from 'lucide-react';

export default function Booking() {
  const { ref, isVisible } = useIO(0.1, null);
  const location = useLocation();
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceChange = (service) => {
    setSelectedService(service);
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
      className="relative min-h-dvh w-full px-4 py-20 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden"
    >
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className={`container mx-auto px-4 mb-16 relative z-10 flex flex-col justify-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className={`text-4xl md:text-5xl font-bold text-center mb-4`}>Choose Your Service</h1>
        <p className='text-center text-slate-600' >Book your appointment with our professional mental health team. Choose the service that best fits your needs.</p>
      </div>

      <ServiceSelection
        selectedService={selectedService}
        onServiceChange={handleServiceChange}
      />


      {/* {selectedService && ( */}
      {/*   <div>{selectedService}</div> */}
      {/* )} */}
    </section >
  );
}
