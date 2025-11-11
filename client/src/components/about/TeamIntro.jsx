{/* 
  TODO
    * Add Parallax on team image
    * Fix Transitions
    * Add Individual
    * Backup Images

*/}
import useIO from '../../hooks/useIO';
import { Brain, History } from 'lucide-react'

export default function TeamIntro() {
  const { ref, visibleItems } = useIO();

  return (
    <div
      ref={ref}
      className={`container mx-auto py-24 px-4 mb-16 relative z-10 flex flex-col text-center max-w-6xl justify-center transition-all duration-700 `}
    >
      <div className="flex flex-col items-center gap-4">
        <h1
          data-item-id="1"
          data-delay="100"
          className={`text-4xl md:text-5xl font-bold text-center text-slate-800 transition-all duration-700 ${visibleItems['1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          Meet Our Team
        </h1>
        <Brain className={`w-6 h-6 text-primary transition-all duration-700 ${visibleItems['1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} hover:scale-110`} />
        <p
          classname={`text-center text-slate-600 mx-auto leading-relaxed mb-8 transition-all duration-700 ${visibleItems['1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
          We’re a collective of licensed psychologists, counselors, and
          psychometricians united by one mission: to make mental health care
          compassionate, accessible, and grounded in evidence. We believe every
          story deserves to be heard and that healing happens when science meets
          empathy.
        </p>
      </div>

      <img src="images/team-full.jpg" alt="" />

      <div
        data-item-id="2"
        data-delay="250"
        className={`grid md:grid-cols-2 gap-2 mb-8 py-24`}
      >
        <div className="flex flex-col items-start justify-center gap-2 px-4">
          <History strokeWidth='1.25' className="w-6 h-6 text-slate-700 text-center" />
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-800">Our Humble Origins</h2>
        </div>
        <div className="text-left space-y-4 text-slate-600 leading-relaxed">
          <p>
            What began as a small counseling space in 2017 has since grown into
            a thriving center for holistic mental wellness. Our founders started
            by offering free sessions to students and young professionals,
            believing that early access to mental health support can change the
            course of a person’s life.</p>
          <p>
            Over the years, our practice has evolved but our heart remains the
            same: to create a safe, inclusive space for anyone seeking growth,
            healing, and understanding.</p>
        </div>
      </div>

      <div className="space-y-8 text-slate-700">
        <div
          data-item-id="3"
          data-delay="500"
          className={`transition-all duration-700 ${visibleItems['2'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className='text-2xl font-semibold text-primary mb-2'>Our Mission</h2>
          <p className='text-base text-slate-600'>
            To provide accessible, ethical, and personalized psychological services that empower individuals and communities toward mental wellness
          </p>
        </div>
        <div
          data-item-id="4"
          data-delay="900"
          className={`transition-all duration-700 ${visibleItems['3'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className='text-2xl font-semibold text-accent mb-2'>Our Vision</h2>
          <p className='text-base text-slate-600'>
            A society where mental health is valued as an essential part of human flourishing.
          </p>
        </div>
      </div>
    </div >

  )
}
