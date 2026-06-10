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
