import useIO from '../../hooks/useIO';

export default function TeamIntro() {
  const { ref, visibleItems } = useIO();

  return (
    <div
      ref={ref}
      className={`container mx-auto py-24 px-4 mb-16 relative z-10 flex flex-col text-center max-w-4xl justify-center transition-all duration-700 `}
    >
      <h1
        data-item-id="1"
        data-delay="100"
        className={`text-4xl md:text-5xl font-bold text-center mb-4 text-slate-800 transition-all duration-700 ${visibleItems['1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >
        Meet Our Team
      </h1>
      <p
        className={`text-center text-slate-600 mx-auto leading-relaxed mb-8 transition-all duration-700 ${visibleItems['1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
        We are a team of licensed mental health professionnals commited to fostering well-being through compassion, collaboration, and science-based care.
      </p>

      <div className="space-y-8 text-slate-700">
        <div
          data-item-id="2"
          data-delay="500"
          className={`transition-all duration-700 ${visibleItems['2'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className='text-2xl font-semibold text-primary mb-2'>Our Mission</h2>
          <p className='text-base text-slate-600'>
            To provide accessible, ethical, and personalized psychological services that empower individuals and communities toward mental wellness
          </p>
        </div>
        <div
          data-item-id="3"
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
