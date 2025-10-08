import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx'
// import Home from './pages/Home.jsx'
// import Booking from './pages/Booking.jsx'
// import About from './pages/About.jsx'
// import Articles from './pages/Articles.jsx'
// import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <div>Hello
      <Navbar />
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <h1 className="font-bold text-white">Hello World!</h1>
      </div>

    </div>
  )
}
//
// function App() {
//
//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen">
//         Hello
//         <Navbar />
//         <main className='flex-grow'>
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/booking" element={<Booking />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/articles" element={<Articles />} />
//             <Route path="/contact" element={<Contact />} />
//           </Routes>
//         </main>
//         <Footer />
//       </div>
//     </Router>
//   )
// }
//
// export default App
