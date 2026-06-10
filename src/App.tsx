import { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Process from './components/Process';
import Portfolio from './components/Portfolio';
import WhyPolyxos from './components/WhyPolyxos';
import AuditCTA from './components/AuditCTA';
import Technologies from './components/Technologies';
import ContactCTABanner from './components/ContactCTABanner';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import StarfieldBackground from './components/StarfieldBackground';
import { BrandProvider } from './context/BrandContext';

function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return <div ref={cursorRef} className="cursor-glow hidden lg:block" />;
}

function MainSite() {
  return (
    <div className="relative min-h-screen text-white" style={{ background: '#030308' }}>
      {/* ── Global starfield — fixed behind every section ── */}
      <StarfieldBackground />

      <CursorGlow />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Services />
        <Process />
        <Portfolio />
        <WhyPolyxos />
        <AuditCTA />
        <Technologies />
        <ContactCTABanner />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const isAdmin = window.location.pathname === '/admin';
  return (
    <BrandProvider>
      {isAdmin ? <Admin /> : <MainSite />}
    </BrandProvider>
  );
}
