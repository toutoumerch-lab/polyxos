import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Zap } from 'lucide-react';

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
      id="hero"
    >
      {/* Dynamic background orbs */}
      <div
        className="orb orb-blue w-[600px] h-[600px] opacity-60 transition-all duration-700"
        style={{
          left: `${mousePos.x * 0.3}%`,
          top: `${mousePos.y * 0.3}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="orb orb-violet w-[400px] h-[400px] opacity-40 bottom-[20%] right-[10%]" />
      <div className="orb orb-cyan w-[300px] h-[300px] opacity-30 top-[30%] right-[20%]" />

      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-blue-500 opacity-60 animate-float" />
      <div className="absolute top-40 right-[15%] w-1.5 h-1.5 rounded-full bg-violet-500 opacity-60 animate-float-delay" />
      <div className="absolute bottom-40 left-[20%] w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-40 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[60%] right-[5%] w-1.5 h-1.5 rounded-full bg-blue-400 opacity-50 animate-float-delay" />

      {/* Animated ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full border border-blue-500/5 animate-spin-slow" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-violet-500/8" style={{ animation: 'spin-slow 15s linear infinite reverse' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 mb-8 animate-fade-in">
          <Zap size={14} className="text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">Premium Technology Agency</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black mb-6 leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)' }}>
          We Build{' '}
          <span className="relative inline-block">
            <span className="gradient-text">Everything</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 9C50 3 100 1 150 5C200 9 250 3 298 9" stroke="url(#underline-grad)" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="0.5" stopColor="#8B5CF6"/>
                  <stop offset="1" stopColor="#06B6D4"/>
                </linearGradient>
              </defs>
            </svg>
          </span>{' '}
          <br />
          <span className="text-white">in Your Mind.</span>
        </h1>

        {/* Description */}
        <p className="section-subtitle max-w-2xl mx-auto mb-10 text-xl">
          From concept to code, we transform your boldest ideas into powerful digital products — websites, apps, and custom software that scale.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            id="hero-start-project"
            onClick={() => scrollToSection('#contact')}
            className="btn-primary text-base flex items-center gap-2 group"
          >
            Start Your Project
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            id="hero-view-services"
            onClick={() => scrollToSection('#services')}
            className="btn-secondary text-base flex items-center gap-2"
          >
            <Play size={16} className="text-blue-400" />
            View Services
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '150+', label: 'Projects Delivered' },
            { value: '98%', label: 'Client Satisfaction' },
            { value: '5+', label: 'Years Experience' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center border border-white/5 hover:border-blue-500/30 transition-all duration-300">
              <div className="font-display text-2xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
