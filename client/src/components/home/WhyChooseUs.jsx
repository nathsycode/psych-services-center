import { useEffect, useRef, useState } from 'react';
import { Award, Shield, Calendar, Heart } from 'lucide-react';

export default function WhyChooseUs() {
  const [visibleCards, setVisibleCards] = useState({});
  const sectionRef = useRef(null);

  const features = [
    {
      id: 1,
      icon: Award,
      title: 'Licensed Professionals',
      desc: 'All our therapists and psychologists are licensed, experienced, and committed to your wellbeing.',
      accentColor: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      delay: 0,
    },
    {
      id: 2,
      icon: Shield,
      title: 'Confidential & Safe',
      desc: 'Your privacy is our priority. All sessions and records are kept strictly confidential.',
      accentColor: 'from-cyan-500 to-cyan-600',
      lightBg: 'bg-cyan-50',
      delay: 100,
    },
    {
      id: 3,
      icon: Calendar,
      title: 'Flexible Scheduling',
      desc: 'Book appointments that fit your schedule with convenient online and in-person options.',
      accentColor: 'from-teal-500 to-teal-600',
      lightBg: 'bg-teal-50',
      delay: 200,
    },
    {
      id: 4,
      icon: Heart,
      title: 'Evidence-Based Care',
      desc: 'We use proven therapeutic approaches tailored to your unique needs and goals.',
      accentColor: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      delay: 300,
    },
  ];

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
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're committed to providing the highest quality mental health care with compassion and professionalism
          </p>
        </div>

        <div
          ref={sectionRef}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isVisible = visibleCards[feature.id];

            return (
              <div
                key={feature.id}
                data-card-id={feature.id}
                data-delay={feature.delay}
                className={`group h-full transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
              >
                <div
                  className={`h-full ${feature.lightBg} rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200`}
                >
                  <div
                    className={`inline-flex bg-gradient-to-br ${feature.accentColor} p-4 rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  <div
                    className={`h-1 w-0 bg-gradient-to-r ${feature.accentColor} mt-6 group-hover:w-12 transition-all duration-300`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
