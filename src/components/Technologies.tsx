import { useRef, useEffect, useState } from 'react';

const technologies = [
  { name: 'React.js', color: '#61DAFB', icon: '⚛' },
  { name: 'Node.js', color: '#339933', icon: '🟢' },
  { name: 'Express.js', color: '#ffffff', icon: '🚀' },
  { name: 'PostgreSQL', color: '#336791', icon: '🐘' },
  { name: 'Tailwind CSS', color: '#06B6D4', icon: '🎨' },
  { name: 'Docker', color: '#2496ED', icon: '🐳' },
  { name: 'Next.js', color: '#ffffff', icon: '▲' },
  { name: 'TypeScript', color: '#3178C6', icon: '📘' },
  { name: 'GraphQL', color: '#E10098', icon: '◈' },
  { name: 'Redis', color: '#DC382D', icon: '⚡' },
  { name: 'AWS', color: '#FF9900', icon: '☁' },
  { name: 'Figma', color: '#F24E1E', icon: '🎭' },
];

// SVG Tech Icons
function TechIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, JSX.Element> = {
    'React.js': (
      <svg viewBox="-11.5 -10.232 23 20.463" className="w-6 h-6">
        <circle r="2.05" fill={color}/>
        <g stroke={color} strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
    ),
    'Node.js': (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={color}>
        <path d="M12 1.85c-.27 0-.55.07-.78.2L3.78 6.35C3.3 6.6 3 7.1 3 7.63v8.74c0 .54.3 1.03.78 1.28l7.44 4.3c.48.28 1.08.28 1.56 0l7.44-4.3c.48-.25.78-.74.78-1.28V7.63c0-.53-.3-1.03-.78-1.28L12.78 2.05C12.55 1.92 12.28 1.85 12 1.85z"/>
      </svg>
    ),
    default: null,
  };
  return icons[name] || null;
}

export default function Technologies() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
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
              <span className="text-lg">{tech.icon}</span>
              <span>{tech.name}</span>
            </div>
          ))}
        </div>

        {/* Decorative orbit */}
        <div className={`relative mt-24 h-64 flex items-center justify-center transition-all duration-1000 delay-500 ${inView ? 'opacity-100' : 'opacity-0'}`}>
          {/* Center */}
          <div className="relative z-10 w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center glow-blue shadow-2xl">
            <span className="text-white font-display font-black text-2xl">P</span>
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
