import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Booking = lazy(() => import("./pages/Booking.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Articles = lazy(() => import("./pages/Articles.jsx"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const ChatWidget = lazy(() => import("./components/chat/ChatWidget.jsx"));

function MainFallback() {
  return (
    <div className="container mx-auto px-4 py-16 text-center text-slate-500">
      Loading...
    </div>
  );
}

export default function App() {
  const [shouldLoadChat, setShouldLoadChat] = useState(false);

  useEffect(() => {
    const loadChat = () => setShouldLoadChat(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadChat, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(loadChat, 800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow w-full">
          <Suspense fallback={<MainFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/about" element={<About />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
        {shouldLoadChat ? (
          <Suspense fallback={null}>
            <ChatWidget />
          </Suspense>
        ) : null}
        <Footer />
      </div>
    </Router>
  );
}
