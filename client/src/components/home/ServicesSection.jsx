import { useState } from 'react';
import { Link } from 'react-router-dom'
import { Video, Clipboard, ArrowRight } from 'lucide-react';
import servicesData from '../../data/services.json';

export default function ServicesSection() {
  const [flipped, setFlipped] = useState({});
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleMouseMove = (e, cardId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const toggleFlip = (id) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const iconMap = {
    'Video': Video,
    'Clipboard': Clipboard,
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Choose the mental health support that works best for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {servicesData.map((service) => {
            const Icon = iconMap[service.icon];
            const isFlipped = flipped[service.id];
            const isHovered = hoveredCard === service.id;

            return (
              <div
                key={service.id}
                className={`h-96 relative ${!isFlipped ? 'cursor-none' : 'cursor-auto'}`}
                onClick={() => toggleFlip(service.id)}
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleMouseMove(e, service.id)}
              >
                {isHovered && !isFlipped && (
                  <div
                    className="absolute pointer-events-none z-50 transition-opacity duration-200"
                    style={{
                      left: `${cursorPosition.x}px`,
                      top: `${cursorPosition.y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}>
                    <div
                      className="bg-slate-900 text-white text-xs font-semibold w-24 h-24 rounded-full shadow-lg flex items-center justify-center text-center">Click to learn more</div>
                  </div>
                )}

                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 hover:bg-gradient-to-tl rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex flex-col h-full">
                      {Icon && <Icon className="w-16 h-16 text-primary mb-6" />}
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                      <p className="text-slate-600 mb-6 flex-grow">{service.shortDescription}</p>
                      <div className={`flex items-center space-x-2 text-primary font-semibold transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                        <span>Click to learn more</span>
                        <ArrowRight className="w-4 h-4"></ArrowRight>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-primary to-accent rounded-2xl p-8 shadow-lg hover:shadow-2xl text-white"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className="text-2xl font-bold mb-4">Details</h3>
                      <div className="mb-6 flex-grow">
                        <p className="text-sm mb-4">{service.fullDesc}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">What's Included:</p>
                          <ul className="text-sm space-y-1">
                            {service.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-center space-x-2"
                              >
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{service.duration}</span>
                        <Link
                          to="/booking"
                          className="inline-block bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300 hover:scale-105"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section >

  )
}
