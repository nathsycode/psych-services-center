import { Link } from 'react-router-dom';
import { Brain, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Booking', path: '/booking' },
    { name: 'About', path: '/about' },
    { name: 'Articles', path: '/articles' },
    { name: 'Contact', path: '/contact' },
  ];

  const services = [
    { name: 'Online Consultation', path: '/booking' },
    { name: 'Psychological Assessment', path: '/booking' },
    { name: 'Mental Health Resources', path: '/articles' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ]
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand with Social Links */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 group">
              <Brain className="w-8 h-8 text-primary transition-transform group-hover:scale-110"></Brain>
              <span className="text-xl font-bold text-white">MindCare Center</span>
            </div>
            <p className="text-sm">
              Professional mental health services dedicated to your wellbeing and personal growth
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="hover:text-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li>
                  <Link
                    to={service.path}
                    className="text-sm hover:text-primary transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="w-h h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">123 Wellness Street, Metro Manila, Philippines</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-h h-5 text-primary flex-shrink-0" />
                <span className="text-sm">+639 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-h h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">hello@mindcare.ph</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-400">© {currentYear} MindCare Center. All rights reserved.</p>
            <p className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded">Porftolio Project - Demo Only</p>
          </div>
        </div>
      </div>

    </footer>
  )
}
