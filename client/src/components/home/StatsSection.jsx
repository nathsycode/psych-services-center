import { useEffect, useRef, useState } from 'react';
import { Users, TrendingUp, Award, Heart } from 'lucide-react';

const CircularProgress = ({ percentage, duration = 2000, size = 120 }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const circumference = 2 * Math.PI * (size / 2 - 8);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayPercentage(Math.floor(progress * percentage));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percentage, duration])

  const offset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <defs>
          <linearGradient
            id="gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl text-slate-900 font-bold">{displayPercentage}</div>
          <div className="text-xs text-slate-600 mt-1">%</div>
        </div>
      </div>
    </div>
  );
};

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
  const [visibleStats, setVisibleStats] = useState({});
  const sectionRef = useRef(null);

  const stats = [
    {
      id: 1,
      icon: Users,
      label: 'Clients Helped',
      value: 500,
      suffix: '+',
      type: 'counter',
      color: 'from-blue-500 to-blue-600',
      delay: 0,
    },
    {
      id: 2,
      icon: TrendingUp,
      label: 'Success Rate',
      value: 92,
      suffix: '%',
      type: 'progress',
      color: 'from-cyan-500 to-cyan-600',
      delay: 100,
    },
    {
      id: 3,
      icon: Award,
      label: 'Years Experience',
      value: 15,
      suffix: '+',
      type: 'counter',
      color: 'from-teal-500 to-teal-600',
      delay: 200,
    },
    {
      id: 4,
      icon: Heart,
      label: 'Sessions  Monthly',
      value: 200,
      suffix: '+',
      type: 'counter',
      color: 'from-purple-500 to-purple-600',
      delay: 300,
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statId = entry.target.dataset.statId;
            setTimeout(() => {
              setVisibleStats(prev => ({ ...prev, [statId]: true }));
            }, parseInt(entry.target.dataset.delay));
          }
        })
      }, { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const statCards = sectionRef.current.querySelectorAll('[data-stat-id]');
      statCards.forEach(card => observer.observe(card));
    }

    return () => observer.disconnect();
  }, []);

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
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isVisible = visibleStats[stat.id];

            return (
              <div
                key={stat.id}
                data-stat-id={stat.id}
                data-delay={stat.delay}
                className={`group transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
              >
                <div className="h-full bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200">
                  <div className={`inline-flex bg-gradient-to-br ${stat.color} p-4 rounded-xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex justify-center mb-6">
                    {stat.type === 'progress' ? (
                      isVisible && <CircularProgress percentage={stat.value} />
                    ) : (

                      <div className="relative inline-flex items-center justify-center">
                        <svg width="120" height='120' className='transform -rotate-90 opacity-20'>
                          <circle
                            cx='60'
                            cy='60'
                            r='52'
                            fill='none'
                            stroke='#e2e8f0'
                            strokeWidth='8'
                          />
                        </svg>

                        <div className='absolute text-center'>
                          <div className='text-4xl font-bold text-slate-900'>
                            {isVisible ? <CounterAnimation end={stat.value} /> : 0}
                          </div>
                          <div className="text-lg font-semibold text-slate-600">{stat.suffix}</div>
                        </div>
                      </div>
                    )
                    }
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 text-center">{stat.label}</h3>

                  <div className={`h-1 w-0 bg-gradient-to-r ${stat.color} mx-auto  mt-4 group-hover:w12 transition-all  duration-300`} />

                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
