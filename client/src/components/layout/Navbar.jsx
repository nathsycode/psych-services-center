import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Booking', path: '/booking' },
    { name: 'About', path: '/about' },
    { name: 'Articles', path: '/articles' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 group">
            <Brain className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-slate-800">MindCare Center</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-300 relative group ${isActive(link.path) ? 'text-primary' : 'text-slate-600 hover:text-primary'
                  }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform transition-transform origin-left duration-300 ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              to="/booking"
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-all hover:shadow-lg hover:scale-105"
            >
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden text-slate-600 hover:text-primary transition-colors'
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className='w-6 h-6' />}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${isActive(link.path) ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link
            to="/booking"
            onClick={() => setIsOpen(false)}
            className="block mx-4 text-center bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  )
}

