import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // const location = useLocation();

  const NavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Booking', path: '/booking' },
    { name: 'About', path: '/about' },
    { name: 'Articles', path: '/articles' },
    { name: 'Contact', path: '/contact' },
  ];

  // const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      Navbar
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            {/*   <Brain className="w-8 h-8 text-primary transition-transform group-hover:scale-110" /> */}
            {/*   <span className="text-xl font-bold text-slate-800">MindCare Center</span> */}
          </Link>
        </div>
      </div>
    </nav>
  )
}

