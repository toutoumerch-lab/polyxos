import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import HeroCubes3D from './HeroCubes3D';

// ── 3D Logo constants ──────────────────────────────────────────────────────────
// Each square: 52×52px face, 12px gap → 64px step
// 3D extrusion: 9px right, 7px up (simulates top-right light source)
const SQ   = 52;   // face size
const GAP  = 12;   // gap between squares
const STEP = SQ + GAP; // 64px
const DX   = 10;   // extrusion X (right)
const DY   = 8;    // extrusion Y (up, negative direction)

// Faithfully reconstructed from the actual Polyxos logo image:
//   Col 0-3, Row 0-4 grid with specific squares filled.
//   Colors transition from deep indigo → blue → bright cyan → back to indigo.
interface Sq3D {
  col: number; row: number;
  front: string;   // front face color
  top:   string;   // top extruded face (lighter)
  side:  string;   // right extruded face (darker)
  cyan?: boolean;  // is this the bright cyan highlight square?
}

const LOGO_SQUARES: Sq3D[] = [
  // ── Row 0: top band (3 squares) ──
  { col: 0, row: 0, front: '#4338ca', top: '#5b52e0', side: '#2e27a0' },
  { col: 1, row: 0, front: '#4f46e5', top: '#7068ef', side: '#3730a3' },
  { col: 2, row: 0, front: '#6366f1', top: '#8b8ef7', side: '#4b4ece' },

  // ── Row 1: widest band (4 squares) ──
  { col: 0, row: 1, front: '#3730a3', top: '#4f46e5', side: '#25217a' },
  { col: 1, row: 1, front: '#2563eb', top: '#4d87f5', side: '#1a4dc2' },
  { col: 2, row: 1, front: '#3b82f6', top: '#6ba3f8', side: '#2468d4' },
  { col: 3, row: 1, front: '#818cf8', top: '#a8b0fa', side: '#6068d6' },

  // ── Row 2: narrows to 2 (cyan highlight on col 1) ──
  { col: 0, row: 2, front: '#1d4ed8', top: '#3b7bef', side: '#153da6' },
  { col: 1, row: 2, front: '#06b6d4', top: '#38d4ed', side: '#0490aa', cyan: true },

  // ── Row 3: single square (col 1) ──
  { col: 1, row: 3, front: '#4f46e5', top: '#7068ef', side: '#3730a3' },

  // ── Row 4: single square (col 0, bottom-left) ──
  { col: 0, row: 4, front: '#3730a3', top: '#4f46e5', side: '#25217a' },
];

// ── SVG canvas dimensions ──────────────────────────────────────────────────────
// Grid occupies 4 cols × 5 rows (with DX extrusion on right, DY up)
// Grid W: 4*64 + DX = 266, Grid H: 5*64 + DY = 328
// XOS text starts at x ≈ 316, fits within 800 wide
const VW = 820;
const VH = 370;
const GX = 22;           // grid start X
const GY = 22;           // grid start Y (leaves room for DY extrusion going up)
const TEXT_X = 316;      // XOS text start X
const FONT_SZ = 222;     // XOS font size
const XOS_Y = 300;       // XOS baseline Y

// ── The 3D logo SVG component ──────────────────────────────────────────────────
function PolyxosLogo3D() {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="hero-logo-3d"
      style={{ width: 'min(860px, 96vw)', height: 'auto' }}
    >
      <defs>
        {/* ── Filters ── */}
        <filter id="sq-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="cyan-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="xos-depth" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="5" dy="5" stdDeviation="4" floodColor="#0e1a6e" floodOpacity="0.8"/>
          <feDropShadow dx="0" dy="0" stdDeviation="20" floodColor="#06b6d4" floodOpacity="0.3"/>
        </filter>

        {/* ── Gradients ── */}
        {/* XOS fill gradient: blue → indigo → cyan */}
        <linearGradient id="xos-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#3b82f6"/>
          <stop offset="40%"  stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        {/* XOS depth color */}
        <linearGradient id="xos-shadow-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1e3a8a"/>
          <stop offset="100%" stopColor="#155e75"/>
        </linearGradient>
        {/* Square face shine */}
        <linearGradient id="shine" x1="0%" y1="0%" x2="70%" y2="70%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.28)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        {/* Tagline gradient */}
        <linearGradient id="tag-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(148,163,184,0.9)"/>
          <stop offset="100%" stopColor="rgba(96,165,250,0.7)"/>
        </linearGradient>
      </defs>

      {/* ══════════════════════════════════════════════════════════════
          PIXEL GRID — 3D extruded squares
          Each square has: drop-shadow → top face → right face → front face → shine
         ══════════════════════════════════════════════════════════════ */}
      <g transform={`translate(${GX}, ${GY})`}>
        {LOGO_SQUARES.map((sq, i) => {
          const x = sq.col * STEP;
          const y = sq.row * STEP;
          const S = SQ;

          // Top face: parallelogram above the front face (light source = top-right)
          //   Front top-left  → Front top-right  → Extruded top-right → Extruded top-left
          const topFace = [
            `${x},${y}`,
            `${x + S},${y}`,
            `${x + S + DX},${y - DY}`,
            `${x + DX},${y - DY}`,
          ].join(' ');

          // Right face: parallelogram to the right of the front face
          //   Front top-right → Extruded top-right → Extruded bottom-right → Front bottom-right
          const rightFace = [
            `${x + S},${y}`,
            `${x + S + DX},${y - DY}`,
            `${x + S + DX},${y + S - DY}`,
            `${x + S},${y + S}`,
          ].join(' ');

          return (
            <g key={i} filter={sq.cyan ? 'url(#cyan-glow)' : 'url(#sq-glow)'}>
              {/* Soft ground shadow (drawn first = behind everything) */}
              <rect
                x={x + 5} y={y + 5} width={S} height={S}
                rx="5" fill="rgba(0,0,0,0.55)"
              />

              {/* Top extruded face (lighter — catches top light) */}
              <polygon points={topFace} fill={sq.top} opacity="0.95"/>

              {/* Right extruded face (darker — shadow side) */}
              <polygon points={rightFace} fill={sq.side} opacity="0.88"/>

              {/* Front face (main face) */}
              <rect x={x} y={y} width={S} height={S} rx="5" fill={sq.front}/>

              {/* Shine overlay on front face */}
              <rect x={x} y={y} width={S} height={S} rx="5" fill="url(#shine)" opacity="0.75"/>

              {/* Cyan square: extra glowing border ring */}
              {sq.cyan && (
                <>
                  <rect x={x - 3} y={y - 3} width={S + 6} height={S + 6}
                    rx="7" fill="none"
                    stroke="#67e8f9" strokeWidth="2.5" opacity="0.9"/>
                  {/* Inner bright dot / reflection */}
                  <circle cx={x + 14} cy={y + 14} r="6"
                    fill="rgba(103,232,249,0.45)"/>
                </>
              )}

              {/* Top-left inner highlight on every square */}
              <rect x={x + 3} y={y + 3} width={S * 0.4} height={3}
                rx="1.5" fill="rgba(255,255,255,0.35)"/>
              <rect x={x + 3} y={y + 3} width={3} height={S * 0.4}
                rx="1.5" fill="rgba(255,255,255,0.2)"/>
            </g>
          );
        })}
      </g>

      {/* ══════════════════════════════════════════════════════════════
          XOS TEXT — 3D layered for depth illusion
         ══════════════════════════════════════════════════════════════ */}

      {/* Depth layer 3 (deepest, most offset) */}
      <text x={TEXT_X + 10} y={XOS_Y + 10}
        fontFamily="'Outfit','Inter',sans-serif"
        fontWeight="900" fontSize={FONT_SZ}
        fill="#0c1a6e" opacity="0.55">
        XOS
      </text>

      {/* Depth layer 2 */}
      <text x={TEXT_X + 5} y={XOS_Y + 5}
        fontFamily="'Outfit','Inter',sans-serif"
        fontWeight="900" fontSize={FONT_SZ}
        fill="url(#xos-shadow-g)" opacity="0.65">
        XOS
      </text>

      {/* Main XOS (top layer) with depth filter */}
      <text x={TEXT_X} y={XOS_Y}
        fontFamily="'Outfit','Inter',sans-serif"
        fontWeight="900" fontSize={FONT_SZ}
        fill="url(#xos-fill)"
        filter="url(#xos-depth)">
        XOS
      </text>

      {/* Shine / highlight on main text */}
      <text x={TEXT_X} y={XOS_Y}
        fontFamily="'Outfit','Inter',sans-serif"
        fontWeight="900" fontSize={FONT_SZ}
        fill="rgba(255,255,255,0.07)">
        XOS
      </text>

      {/* ── Tagline ── */}
      <text
        x={TEXT_X} y={XOS_Y + 30}
        fontFamily="'Inter',sans-serif"
        fontWeight="500" fontSize="14"
        fill="url(#tag-g)"
        letterSpacing="3">
        SOFTWARE ENGINEERING  /  SYSTEMS DEVELOPMENT
      </text>

      {/* ── Decorative accent: thin horizontal light line ── */}
      <line
        x1={TEXT_X} y1={XOS_Y - FONT_SZ * 0.72}
        x2={VW - 20} y2={XOS_Y - FONT_SZ * 0.72}
        stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
    </svg>
  );
}

// ── Hero section ───────────────────────────────────────────────────────────────
export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef                 = useRef<HTMLDivElement>(null);

  // Mouse parallax
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (heroRef.current) {
        const r = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - r.left) / r.width)  * 100,
          y: ((e.clientY - r.top)  / r.height) * 100,
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

  // Mouse parallax offsets for 3D logo
  const offsetX = (mousePos.x - 50) * 0.09;
  const offsetY = (mousePos.y - 50) * 0.09;

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
      id="hero"
    >
      {/* ── Ambient colour orbs ── */}
      <div
        className="orb orb-blue w-[700px] h-[700px] opacity-35 transition-all duration-700"
        style={{ left: `${mousePos.x * 0.28}%`, top: `${mousePos.y * 0.28}%`, transform: 'translate(-50%,-50%)' }}
      />
      <div className="orb orb-violet w-[500px] h-[500px] opacity-20 bottom-[10%] right-[5%]"/>
      <div className="orb orb-cyan   w-[320px] h-[320px] opacity-18 top-[20%]  right-[15%]"/>

      {/* ── 3D Floating Logo Cubes ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <HeroCubes3D />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3D POLYXOS LOGO BACKGROUND
          — faithfully recreated from the actual brand logo
          — mouse-parallax depth tilt
          — breathing + glow-pulse CSS animations
         ══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <div style={{
          transform: `translate(${offsetX}px, ${offsetY}px)
                      rotateX(${offsetY * 0.25}deg)
                      rotateY(${-offsetX * 0.25}deg)`,
          transition: 'transform 0.12s ease-out',
          willChange: 'transform',
          perspective: '900px',
        }}>
          <PolyxosLogo3D />
        </div>
      </div>

      {/* ── Floating micro-orbs ── */}
      {[
        { style: { top: '18%',  left:  '11%', zIndex: 3 }, cls: 'w-2 h-2 bg-blue-400 opacity-70 animate-float', dur: '5s' },
        { style: { top: '36%',  right: '13%', zIndex: 3 }, cls: 'w-1.5 h-1.5 bg-violet-400 opacity-60 animate-float-delay', dur: '7s' },
        { style: { bottom:'38%',left:  '21%', zIndex: 3, animationDelay:'2.5s' }, cls: 'w-2.5 h-2.5 bg-cyan-400 opacity-40 animate-float' },
        { style: { top: '63%',  right: '6%',  zIndex: 3, animationDelay:'0.8s' }, cls: 'w-1 h-1 bg-blue-300 opacity-50 animate-float-delay' },
        { style: { bottom:'21%',right: '27%', zIndex: 3, animationDelay:'3.5s' }, cls: 'w-1.5 h-1.5 bg-cyan-300 opacity-45 animate-float' },
      ].map((o, i) => (
        <div key={i}
          className={`absolute rounded-full ${o.cls}`}
          style={{ ...o.style, ...(o.dur ? { animationDuration: o.dur } : {}) }}
        />
      ))}

      {/* ══════════════════════════════════════════════════════════════
          MAIN HERO CONTENT
         ══════════════════════════════════════════════════════════════ */}
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
              <path d="M2 9C50 3 100 1 150 5C200 9 250 3 298 9"
                stroke="url(#u-grad)" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="u-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="0.5" stopColor="#8B5CF6"/>
                  <stop offset="1"   stopColor="#06B6D4"/>
                </linearGradient>
              </defs>
            </svg>
          </span>{' '}
          <br/>
          <span className="text-white">in Your Mind.</span>
        </h1>

        {/* Description */}
        <p className="section-subtitle max-w-2xl mx-auto mb-10 text-xl">
          From concept to code, we transform your boldest ideas into powerful digital products —
          websites, apps, and custom software that scale.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            id="hero-start-project"
            onClick={() => scrollToSection('#contact')}
            className="btn-primary text-base flex items-center gap-2 group"
          >
            Start Your Project
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/>
          </button>
          <button
            id="hero-view-services"
            onClick={() => scrollToSection('#services')}
            className="btn-secondary text-base flex items-center gap-2"
          >
            <Play size={16} className="text-blue-400"/>
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
          ].map(stat => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-4 text-center border border-white/5
                         hover:border-blue-500/30 transition-all duration-300
                         hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
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
          <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce"/>
        </div>
      </div>
    </section>
  );
}
