import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';

// Particle definition
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const PARTICLE_COLORS = [
  'rgba(59,130,246,', // blue
  'rgba(139,92,246,', // violet
  'rgba(6,182,212,',  // cyan
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    speedX: (Math.random() - 0.5) * 0.018,
    speedY: (Math.random() - 0.5) * 0.018,
    opacity: Math.random() * 0.7 + 0.2,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));
}

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [particles, setParticles] = useState<Particle[]>(() => generateParticles(55));
  const heroRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>(particles);

  // Mouse parallax
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

  // Animate particles
  useEffect(() => {
    const animate = () => {
      particlesRef.current = particlesRef.current.map((p) => {
        let nx = p.x + p.speedX;
        let ny = p.y + p.speedY;
        if (nx < 0) nx = 100;
        if (nx > 100) nx = 0;
        if (ny < 0) ny = 100;
        if (ny > 100) ny = 0;
        return { ...p, x: nx, y: ny };
      });
      setParticles([...particlesRef.current]);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Parallax offset for logo
  const offsetX = (mousePos.x - 50) * 0.08;
  const offsetY = (mousePos.y - 50) * 0.08;

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
      id="hero"
    >
      {/* ── Ambient orbs ── */}
      <div
        className="orb orb-blue w-[700px] h-[700px] opacity-40 transition-all duration-700"
        style={{ left: `${mousePos.x * 0.28}%`, top: `${mousePos.y * 0.28}%`, transform: 'translate(-50%,-50%)' }}
      />
      <div className="orb orb-violet w-[450px] h-[450px] opacity-25 bottom-[15%] right-[5%]" />
      <div className="orb orb-cyan   w-[300px] h-[300px] opacity-20 top-[25%]  right-[18%]" />

      {/* ── Animated particles ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 1 }}
      >
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.size}
            fill={`${p.color}${p.opacity.toFixed(2)})`}
          />
        ))}
        {/* Connector lines between nearby particles (first 20) */}
        {particles.slice(0, 20).map((p, i) =>
          particles.slice(i + 1, 20).map((q) => {
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 12) {
              return (
                <line
                  key={`${p.id}-${q.id}`}
                  x1={`${p.x}%`} y1={`${p.y}%`}
                  x2={`${q.x}%`} y2={`${q.y}%`}
                  stroke={`rgba(59,130,246,${((12 - dist) / 12) * 0.15})`}
                  strokeWidth="0.5"
                />
              );
            }
            return null;
          })
        )}
      </svg>

      {/* ── 3D Polyxos Logo background ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <div
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px) rotateX(${offsetY * 0.3}deg) rotateY(${-offsetX * 0.3}deg)`,
            transition: 'transform 0.1s ease-out',
            willChange: 'transform',
          }}
        >
          {/* Scan-line shimmer overlay */}
          <div className="relative" style={{ display: 'inline-block' }}>
            <div className="hero-logo-scanline" />
          <svg
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            className="hero-logo-3d"
            style={{
              width: 'min(780px, 95vw)',
              height: 'min(780px, 95vw)',
              opacity: 0.18,
              filter: 'drop-shadow(0 0 80px rgba(59,130,246,0.75)) drop-shadow(0 0 160px rgba(139,92,246,0.55))',
            }}
          >
            <defs>
              {/* Main radial gradient – blue → violet → cyan */}
              <radialGradient id="lgMain" cx="50%" cy="40%" r="60%">
                <stop offset="0%"   stopColor="#67e8f9" stopOpacity="1" />
                <stop offset="35%"  stopColor="#818cf8" stopOpacity="1" />
                <stop offset="70%"  stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
              </radialGradient>

              {/* Highlight shimmer */}
              <linearGradient id="lgShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.25" />
                <stop offset="40%"  stopColor="#a5f3fc" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
              </linearGradient>

              {/* Edge glow ring */}
              <radialGradient id="lgRing" cx="50%" cy="50%" r="50%">
                <stop offset="70%"  stopColor="transparent" />
                <stop offset="88%"  stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>

              {/* Depth shadow for 3-D feel */}
              <filter id="f3d" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="6"  dy="12" stdDeviation="10" floodColor="#3b82f6" floodOpacity="0.5" />
                <feDropShadow dx="-3" dy="-3"  stdDeviation="6"  floodColor="#06b6d4" floodOpacity="0.3" />
                <feDropShadow dx="0"  dy="0"   stdDeviation="30" floodColor="#8b5cf6" floodOpacity="0.4" />
              </filter>

              {/* Inner glow */}
              <filter id="fGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>

              <clipPath id="circleClip">
                <circle cx="200" cy="200" r="175" />
              </clipPath>
            </defs>

            {/* ── Outer glow ring ── */}
            <circle cx="200" cy="200" r="185" fill="url(#lgRing)" />

            {/* ── Main disc (3-D base) ── */}
            <ellipse
              cx="200" cy="215" rx="168" ry="28"
              fill="rgba(59,130,246,0.18)"
              filter="url(#f3d)"
            />
            <circle
              cx="200" cy="200" r="168"
              fill="url(#lgMain)"
              filter="url(#f3d)"
              clipPath="url(#circleClip)"
            />

            {/* ── Inner texture ring ── */}
            <circle cx="200" cy="200" r="168" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(6,182,212,0.12)"   strokeWidth="0.8" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="rgba(139,92,246,0.10)"  strokeWidth="0.8" />

            {/* ── Highlight shimmer overlay ── */}
            <circle cx="200" cy="200" r="168" fill="url(#lgShimmer)" />

            {/* ── "P" letterform – 3D extruded ── */}
            {/* Shadow / depth layer */}
            <text
              x="202" y="252"
              textAnchor="middle"
              fontFamily="'Outfit', 'Inter', sans-serif"
              fontWeight="900"
              fontSize="190"
              fill="rgba(30,27,75,0.6)"
              clipPath="url(#circleClip)"
            >P</text>
            {/* Mid layer */}
            <text
              x="200" y="248"
              textAnchor="middle"
              fontFamily="'Outfit', 'Inter', sans-serif"
              fontWeight="900"
              fontSize="190"
              fill="rgba(59,130,246,0.35)"
              filter="url(#fGlow)"
              clipPath="url(#circleClip)"
            >P</text>
            {/* Top layer */}
            <text
              x="199" y="246"
              textAnchor="middle"
              fontFamily="'Outfit', 'Inter', sans-serif"
              fontWeight="900"
              fontSize="190"
              fill="rgba(255,255,255,0.22)"
              clipPath="url(#circleClip)"
            >P</text>

            {/* ── Star / sparkle accent dots ── */}
            {[
              { cx: 68,  cy: 105, r: 4, col: '#67e8f9' },
              { cx: 332, cy: 105, r: 3, col: '#a78bfa' },
              { cx: 55,  cy: 295, r: 2.5, col: '#3b82f6' },
              { cx: 345, cy: 295, r: 3, col: '#06b6d4' },
              { cx: 200, cy: 40,  r: 3.5, col: '#c4b5fd' },
              { cx: 200, cy: 360, r: 2.5, col: '#67e8f9' },
            ].map((dot, i) => (
              <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.col} opacity="0.9" />
            ))}

            {/* ── Diagonal light streak ── */}
            <line x1="85" y1="85" x2="200" y2="175" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" clipPath="url(#circleClip)" />
          </svg>
          </div>{/* end scan-line wrapper */}
        </div>
      </div>

      {/* ── Floating light orbs (small, animated) ── */}
      <div className="absolute w-2 h-2 rounded-full bg-blue-400 opacity-70 animate-float"
           style={{ top: '18%', left: '12%', animationDuration: '5s' }} />
      <div className="absolute w-1.5 h-1.5 rounded-full bg-violet-400 opacity-60 animate-float-delay"
           style={{ top: '35%', right: '14%', animationDelay: '1.2s' }} />
      <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-40 animate-float"
           style={{ bottom: '38%', left: '22%', animationDelay: '2.5s' }} />
      <div className="absolute w-1 h-1 rounded-full bg-blue-300 opacity-50 animate-float-delay"
           style={{ top: '62%', right: '6%', animationDelay: '0.8s' }} />
      <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 opacity-45 animate-float"
           style={{ bottom: '22%', right: '28%', animationDelay: '3.5s' }} />

      {/* ── Main content ── */}
      <div className="relative text-center max-w-7xl mx-auto px-6 lg:px-8" style={{ zIndex: 10 }}>

        {/* Headline */}
        <h1
          className="font-display font-black mb-6 leading-[1.05] tracking-tight animate-fade-in"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)' }}
        >
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
            { value: '98%',  label: 'Client Satisfaction' },
            { value: '5+',   label: 'Years Experience' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-4 text-center border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            >
              <div className="font-display text-2xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40" style={{ zIndex: 10 }}>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
