import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import testimonialsData from '../../data/testimonials.json';

export default function Testimonials() {
  const [visibleCards, setVisibleCards] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.dataset.cardId;
            setTimeout(() => {
              setVisibleCards(prev => ({ ...prev, [cardId]: true }));
            }, parseInt(entry.target.dataset.delay));
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('[data-card-id]');
      cards.forEach(card => observer.observe(card));
    };

    return () => observer.disconnect();
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? testimonialsData.length - 1 : prev - 1));
  }

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === testimonialsData.length - 1 ? 0 : prev + 1));
  }

  const goToSlide = (index) => {
    setCurrentSlide(index);
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real experiences from people who've benefited from our mental health services
          </p>
        </div>


        {/* Desktop */}
        <div
          ref={sectionRef}
          className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {testimonialsData.map((testimonial) => (
            <div
              key={testimonial.id}
              data-card-id={testimonial.id}
              data-delay={testimonial.delay}
              className={`group transition-all duration-700 transform ${visibleCards[testimonial.id] ? 'opacity-100 transilate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >
              <div className="h-full bg-slate-50 rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2  border border-slate-200">
                <div className="flex space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-all duration-300 group-hover:text-yellow-500"
                      style={{ transitionDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">{testimonial.content}</p>

                <div className="flex items-center space-x-4 border-t border-slate-200 pt-6">
                  <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300`}>{testimonial.initials}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <div
            ref={carouselRef}
            className="relative overflow-hidden"
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonialsData.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-12">
                  <div className="bg-slate-50 rounded-2xl p-8 shadow-md border border-slate-200">
                    <div className="flex space-x-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed italic">{testimonial.content}</p>

                    <div className="flex items-center space-x-4 border-t border-slate-200 pt-6">
                      <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePrevSlide}
              aria-label="Previous testimonial"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-blue-600 active:scale-90 active:bg-slate-600 focus:outline-none focus:ring-blue-300 focus:ring-offset-2 transition-all duration-150 z-10 select-none">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextSlide}
              aria-label="Next testimonial"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-blue-600 active:scale-90 active:bg-slate-600 focus:outline-none focus:ring-blue-300 focus:ring-offset-2 transition-all duration-150 z-10 select-none">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center items-center space-x-3 mt-8">
            {testimonialsData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-primary w-8'
                  : 'bg-slate-300 w-2 hover:bg-slate-400'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
