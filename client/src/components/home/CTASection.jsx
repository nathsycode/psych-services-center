import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import useIO from "../../hooks/useIO";

export default function CTASection() {
  const { ref, isVisible } = useIO(0.1, null);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-accent" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>Take the First Step Today</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Start Your Mental Welness Journey?
          </h2>

          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Don't wait to prioritize your mental health. Our caring professionals are here to support you every step of the way.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/booking"
              className="group w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Book Your Session Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group w-full sm:w-auto bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Contact Us First</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
