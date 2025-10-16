import { Link } from 'react-router-dom'
import { ArrowRight, Video, Clipboard } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-28 overflow-hidden w-full">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 hover:bg-primary/20 transition-colors">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          <span>Professional Mental Health Services</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Your Journey to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Mental Wellness</span>{' '}
          Starts Here
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-x-2xl mx-auto">
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

        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600">
          <div className="flex items-center space-x-2 hover:text-primary transition:colors">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Licensed Professionals</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-primary transition:colors">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-medium">100% Confidential</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-primary transition:colors">
            <div className="w-10 h-10 bg-slate-500/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium">Flexible Scheduling</span>
          </div>
        </div>
      </div>
    </section>
  )
}
