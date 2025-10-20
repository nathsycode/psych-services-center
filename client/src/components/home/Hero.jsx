import { Link } from 'react-router-dom';
import { Clipboard, Video, Award, Shield, Calendar, Heart } from 'lucide-react';
import useIO from '../../hooks/useIO';

export default function Hero() {

  const { ref, isVisible } = useIO(0.1, null);

  const features = [
    {
      icon: Award,
      title: 'Licensed Professionals',
      hoverColor: 'hover:text-blue-500',
      lightBg: 'bg-blue-500/10',
    },
    {
      icon: Shield,
      title: 'Confidential & Safe',
      hoverColor: 'hover:text-cyan-500',
      lightBg: 'bg-cyan-500/10',
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      hoverColor: 'hover:text-teal-500',
      lightBg: 'bg-teal-500/10',
    },
    {
      icon: Heart,
      title: 'Evidence-Based Care',
      hoverColor: 'hover:text-purple-500',
      lightBg: 'bg-purple-500/10',
    },
  ];

  return (
    <section ref={ref} className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg`py-28 overflow-hidden w-full h-dvh flex items-center">
      < div className="absolute inset-0 overflow-hidden">
        <img src="../../../public/images/therapist-2.jpg" alt="therapist background" className={`absolute w-full h-full object-cover filter saturate-50 brightness-100 blur-sm transform transition-all duration-700 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} />
        < div className="absolute inset-0 bg-black/40" />
        {/* <div className="absolute -top-40 -right-40 bg-primary/10 rounded-full blur-3xl" /> */}
        {/* <div className="absolute -bottom-40 -left-40 bg-accent/10 rounded-full blur-3xl" /> */}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-6 hover`bg-primary/20 transition-colors">
          <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-pulse"></span>
          <span>Professional Mental Health Services</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Your Journey to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Mental Wellness</span>{' '}
          Starts Here
        </h1>
        <p className="text-lg md:text-xl text-slate-100 mb-10 max-x-2xl mx-auto">
          Connect with licensed therapists and psychologists for confidential, professional mental health services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/booking"
            className="group w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2">
            <span>Book Online Consultation</span>
            <Video className="w-5 h-5 group-hover:rotate-12 transition-transform"></Video>
          </Link>
          <Link
            to="/booking"
            className="group w-full sm:w-auto bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2">
            <span>Schedule Assessment</span>
            <Clipboard className="w-5 h-5 group-hover:-rotate-12 transition-transform"></Clipboard>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-200">
          {features.map((feature) => {
            return (
              <div className={`flex items-center space-x-2 ${feature.hoverColor} transition:colors duration-300`}>
                <div className={`flex items-center justify-center w-10 h-10 ${feature.lightBg} rounded-full`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{feature.title}</span>
              </div>)
          })}
        </div>
      </div>
    </section>
  )
}
