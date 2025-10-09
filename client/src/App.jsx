import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import About from './pages/About.jsx'
import Articles from './pages/Articles.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/about" element={<About />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/contact" element={<Contact />} />

          </Routes>
        </main>
        <Footer />

      </div>

    </Router>
  )
}
