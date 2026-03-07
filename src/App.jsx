import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Advisory from './pages/Advisory';
import Detector from './pages/Detector';
import Schemes from './pages/Schemes';
import Contact from './pages/Contact';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="main-wrapper">
      <Navbar scrolled={scrollY > 50} onLoginClick={() => setIsAuthModalOpen(true)} />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <main key={location.pathname} className="page-transition-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advisory" element={<Advisory />} />
          <Route path="/detector" element={<Detector />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
