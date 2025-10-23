import { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, Heart } from 'lucide-react';
import useIO from '../../hooks/useIO'

const CounterAnimation = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate)
  }, [end, duration])

  return count;
}
export default function StatsSection() {
  const { ref: imageRef, isVisible: imageVisible } = useIO(0.1, null);
  const { ref: statsRef, visibleItems } = useIO(0.1, '[data-item-id]');

  const stats = [
    {
      id: 1,
      icon: Users,
      label: 'Clients Helped.',
      description: "We have supported over 500 individuals on their mental wellness journey, providing personalized care that makes a real difference in their lives.",
      value: 500,
      suffix: '+',
      type: 'counter',
      hoverColor: 'group-hover:text-blue-500',
      delay: 0,
    },
    {
      id: 2,
      icon: TrendingUp,
      label: 'Success Rate.',
      description: 'Our evidence-based approaches and dedicated professionals have helped 92% of our clients achieve their therapeutic goals and improve their wellbeing.',
      value: 92,
      suffix: '%',
      type: 'progress',
      hoverColor: 'group-hover:text-cyan-500',
      delay: 100,
    },
    {
      id: 3,
      icon: Award,
      label: 'Years Experience.',
      description: 'With over 15 years of combined expertise in psychology and counseling, our team brings deep knowledge and proven methods to every session.',
      value: 15,
      suffix: '+',
      type: 'counter',
      hoverColor: 'group-hover:text-teal-500',
      delay: 200,
    },
    {
      id: 4,
      icon: Heart,
      label: 'Sessions  Monthly.',
      description: 'We conduct over 200 sessions each month, providing consistent support and building lasting relationships with our clients throughout their journey.',
      value: 200,
      suffix: '+',
      type: 'counter',
      hoverColor: 'group-hover:text-purple-500',
      delay: 300,
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Impact</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real numbers that show our commitment to mental health and client wellness
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center x-4"
        >
          <div className="hidden lg:block lg:col-span-1">
            <img
              ref={imageRef}
              src="/images/impact.jpg"
              alt="just a happy photo"
              className={`rounded-2xl object-cover sticky top-8 saturate-50 transition-all duration-1000 transform ${imageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: '100ms' }}
            />
          </div>

          <div ref={statsRef} className="lg:col-span-3 space-y-0">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isStatVisible = visibleItems[stat.id];

              return (
                <div
                  key={stat.id}
                  data-item-id={stat.id}
                  data-delay={stat.delay}
                  className={`grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 border-b border-slate-200 last:border-b-0 py-8 px-4 group hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:-translate-y-1 transition-all duration-700 transform ${isStatVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  <div className="sm:col-span-1 flex flex-col items-center sm:items-start justify-center gap-2">
                    <Icon className={`w-4 h-4 text-slate-400 ${stat.hoverColor} transition-colors duration-300`} />
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-slate-900">
                        {isStatVisible ? <CounterAnimation end={stat.value} /> : 0}
                      </span>
                      <span className={`text-3xl font-bold text-slate-400 ${stat.hoverColor}`}>{stat.suffix}</span>
                    </div>

                  </div>
                  <div className="sm:col-span-3 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">{stat.label}
                      <span className="text-base font-light text-slate-600 leading-relaxed"> {stat.description}</span>
                    </h2>
                  </div>


                </div>
              )
            })}

          </div>
        </div>
      </div>
    </section>
  )
}
