import Hero from '../components/home/Hero';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';

// TODO: Why choose us section. Error on card 1.
// TODO: Testimonials - Profile Icons bug.

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <ServicesSection />
      <WhyChooseUs />
      <Testimonials />
      <StatsSection />
      <CTASection />
    </div>
  );
}
