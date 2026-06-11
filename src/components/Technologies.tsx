import { useRef, useEffect, useState } from 'react';

const STATIC_TECHS = [
  { name: 'React.js', logo_icon: '⚛' },
  { name: 'Node.js', logo_icon: '🟢' },
  { name: 'Express.js', logo_icon: '🚀' },
  { name: 'PostgreSQL', logo_icon: '🐘' },
  { name: 'Tailwind CSS', logo_icon: '🎨' },
  { name: 'Docker', logo_icon: '🐳' },
  { name: 'Next.js', logo_icon: '▲' },
  { name: 'TypeScript', logo_icon: '📘' },
  { name: 'GraphQL', logo_icon: '◈' },
  { name: 'Redis', logo_icon: '⚡' },
  { name: 'AWS', logo_icon: '☁' },
  { name: 'Figma', logo_icon: '🎭' },
];

// 3D Cuboid Face/Bar Component
interface CuboidProps {
  width: number;
  height: number;
  depth: number;
  zOffset?: number;
  rotateZ?: number;
}

function Cuboid({ width, height, depth, zOffset = 0, rotateZ = 0 }: CuboidProps) {
  const w = `${width}px`;
  const h = `${height}px`;
  const d = `${depth}px`;
  
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  return (
    <div
      className="absolute"
      style={{
        width: w,
        height: h,
        transformStyle: 'preserve-3d',
        transform: `translate3d(-50%, -50%, ${zOffset}px) rotateZ(${rotateZ}deg)`,
        left: '50%',
        top: '50%',
      }}
    >
      {/* Front Face */}
      <div
        className="absolute inset-0 rounded-[2px]"
        style={{
          transform: `translate3d(0, 0, ${halfD}px)`,
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
          border: '1px solid rgba(103, 232, 249, 0.4)',
          boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.3)',
        }}
      />
      {/* Back Face */}
      <div
        className="absolute inset-0 rounded-[2px]"
        style={{
          transform: `rotateY(180deg) translate3d(0, 0, ${halfD}px)`,
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
          border: '1px solid rgba(103, 232, 249, 0.3)',
        }}
      />
      {/* Left Face */}
      <div
        className="absolute inset-y-0 rounded-[2px]"
        style={{
          width: d,
          left: '50%',
          marginLeft: `-${halfD}px`,
          transform: `rotateY(-90deg) translate3d(0, 0, ${halfW}px)`,
          backgroundColor: '#3730a3',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
      {/* Right Face */}
      <div
        className="absolute inset-y-0 rounded-[2px]"
        style={{
          width: d,
          left: '50%',
          marginLeft: `-${halfD}px`,
          transform: `rotateY(90deg) translate3d(0, 0, ${halfW}px)`,
          backgroundColor: '#2e27a0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
      {/* Top Face */}
      <div
        className="absolute inset-x-0 rounded-[2px]"
        style={{
          height: d,
          top: '50%',
          marginTop: `-${halfD}px`,
          transform: `rotateX(90deg) translate3d(0, 0, ${halfH}px)`,
          backgroundColor: '#38d4ed',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      />
      {/* Bottom Face */}
      <div
        className="absolute inset-x-0 rounded-[2px]"
        style={{
          height: d,
          top: '50%',
          marginTop: `-${halfD}px`,
          transform: `rotateX(-90deg) translate3d(0, 0, ${halfH}px)`,
          backgroundColor: '#1e1b4b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
    </div>
  );
}

function LogoX3D() {
  return (
    <>
      <style>{`
        @keyframes spin3D {
          0% {
            transform: rotateX(16deg) rotateY(0deg) rotateZ(2deg);
          }
          50% {
            transform: rotateX(-12deg) rotateY(180deg) rotateZ(-2deg);
          }
          100% {
            transform: rotateX(16deg) rotateY(360deg) rotateZ(2deg);
          }
        }
        .animate-spin3d {
          animation: spin3D 8s linear infinite;
        }
      `}</style>
      <div
        className="relative w-16 h-16 animate-spin3d flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Bar 1: diagonal top-left to bottom-right */}
        <Cuboid width={10} height={46} depth={10} zOffset={0.2} rotateZ={45} />
        {/* Bar 2: diagonal top-right to bottom-left */}
        <Cuboid width={10} height={46} depth={10} zOffset={-0.2} rotateZ={-45} />
      </div>
    </>
  );
}

export default function Technologies() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [technologies, setTechnologies] = useState<any[]>(STATIC_TECHS);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const res = await fetch('/api/technologies');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setTechnologies(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch technologies:', err);
      }
    };
    fetchTechs();
  }, []);

  return (
    <section id="technologies" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-transparent" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="section-label mb-4">Our Stack</p>
          <h2 className="section-title mb-6">
            Technologies We{' '}
            <span className="gradient-text">Master</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            We work with the industry's most powerful and reliable technologies to build exceptional products.
          </p>
        </div>

        {/* Tech grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {technologies.map((tech, i) => (
            <div
              key={tech.name}
              className={`tech-badge transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="text-lg">{tech.logo_icon}</span>
              <span>{tech.name}</span>
            </div>
          ))}
        </div>

        {/* Decorative orbit */}
        <div className={`relative mt-24 h-64 flex items-center justify-center transition-all duration-1000 delay-500 ${inView ? 'opacity-100' : 'opacity-0'}`}>
          {/* Center */}
          <div 
            className="relative z-10 w-20 h-20 rounded-2xl bg-slate-950/70 border border-violet-500/30 flex items-center justify-center glow-blue shadow-2xl backdrop-blur-md"
            style={{ perspective: '300px' }}
          >
            <LogoX3D />
          </div>
          
          {/* Ring 1 */}
          <div className="absolute w-44 h-44 rounded-full border border-blue-500/20 animate-spin-slow" />
          
          {/* Ring 2 */}
          <div className="absolute w-80 h-80 rounded-full border border-violet-500/10" style={{ animation: 'spin-slow 30s linear infinite reverse' }}>
            {[0, 1, 2, 3].map((j) => (
              <div
                key={j}
                className="absolute w-8 h-8 rounded-full glass border border-blue-500/20 flex items-center justify-center text-xs"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${j * 90}deg) translateX(158px) rotate(-${j * 90}deg) translate(-50%, -50%)`,
                }}
              >
                {['⚛', '🐳', '▲', '📘'][j]}
              </div>
            ))}
          </div>

          {/* Ring 3 */}
          <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/5" style={{ animation: 'spin-slow 45s linear infinite' }}>
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <div
                key={j}
                className="absolute w-6 h-6 rounded-full glass border border-violet-500/20 flex items-center justify-center text-xs"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${j * 60}deg) translateX(248px) rotate(-${j * 60}deg) translate(-50%, -50%)`,
                }}
              >
                {['🟢', '🐘', '🎨', '⚡', '☁', '🎭'][j]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
