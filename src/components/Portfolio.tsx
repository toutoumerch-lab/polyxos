import { useRef, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const projects = [
  {
    id: 'fintech-platform',
    title: 'FinPulse Dashboard',
    category: 'Web Application',
    description: 'Real-time financial analytics platform with AI-powered insights and interactive data visualizations.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    accentColor: '#3B82F6',
    mockBg: 'from-slate-900 to-blue-950',
  },
  {
    id: 'ecommerce-app',
    title: 'ShopNova Mobile',
    category: 'Mobile App',
    description: 'Cross-platform e-commerce app with AR product preview, seamless checkout, and real-time order tracking.',
    tags: ['React Native', 'Express.js', 'Stripe'],
    gradient: 'from-violet-600 via-purple-500 to-pink-400',
    accentColor: '#8B5CF6',
    mockBg: 'from-slate-900 to-violet-950',
  },
  {
    id: 'saas-platform',
    title: 'Orion SaaS Platform',
    category: 'Custom Software',
    description: 'Enterprise project management suite with team collaboration, automated workflows, and advanced reporting.',
    tags: ['Next.js', 'Docker', 'PostgreSQL'],
    gradient: 'from-cyan-500 via-teal-400 to-emerald-400',
    accentColor: '#06B6D4',
    mockBg: 'from-slate-900 to-cyan-950',
  },
  {
    id: 'brand-redesign',
    title: 'Luxe Brand Identity',
    category: 'UI/UX Design',
    description: 'Complete brand identity and design system for a luxury fashion brand, including web and mobile touchpoints.',
    tags: ['Figma', 'Design System', 'Branding'],
    gradient: 'from-pink-500 via-rose-500 to-orange-400',
    accentColor: '#EC4899',
    mockBg: 'from-slate-900 to-pink-950',
  },
  {
    id: 'healthcare-app',
    title: 'MediTrack Pro',
    category: 'Mobile App',
    description: 'HIPAA-compliant healthcare management app connecting patients, doctors, and pharmacies in one ecosystem.',
    tags: ['React Native', 'Node.js', 'MongoDB'],
    gradient: 'from-emerald-500 via-green-400 to-teal-400',
    accentColor: '#10B981',
    mockBg: 'from-slate-900 to-emerald-950',
  },
  {
    id: 'analytics-dashboard',
    title: 'DataSphere Analytics',
    category: 'Web Application',
    description: 'Advanced marketing analytics platform with predictive modeling and multi-channel attribution tracking.',
    tags: ['React', 'D3.js', 'Python'],
    gradient: 'from-amber-500 via-yellow-500 to-orange-400',
    accentColor: '#F59E0B',
    mockBg: 'from-slate-900 to-amber-950',
  },
];

function ProjectCard({ project, index, inView }: { project: typeof projects[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id={`portfolio-${project.id}`}
      className={`portfolio-card group transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Visual mockup */}
      <div className={`h-52 bg-gradient-to-br ${project.mockBg} relative overflow-hidden`}>
        {/* Geometric mock UI */}
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />
        
        {/* Mock browser/app UI */}
        <div className="absolute inset-4 glass rounded-xl overflow-hidden border border-white/10">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 h-2 bg-white/10 rounded-full mx-2" />
          </div>
          {/* Mock content */}
          <div className="p-3 space-y-2">
            <div className={`h-3 rounded-full w-2/3 bg-gradient-to-r ${project.gradient} opacity-60`} />
            <div className="h-2 rounded-full w-full bg-white/10" />
            <div className="h-2 rounded-full w-4/5 bg-white/10" />
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className={`h-12 rounded-lg bg-gradient-to-br ${project.gradient} opacity-${30 + j * 10}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Hover overlay with CTA */}
        <div className={`overlay transition-all duration-400 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: project.accentColor }}>{project.category}</p>
              <p className="text-white font-bold text-sm">{project.title}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: project.accentColor }}
            >
              <ExternalLink size={15} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: project.accentColor }}>{project.category}</p>
            <h3 className="font-display text-lg font-bold text-white">{project.title}</h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: `${project.accentColor}15`, color: project.accentColor, border: `1px solid ${project.accentColor}25` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden">
      <div className="orb orb-violet w-[500px] h-[500px] opacity-15 right-0 top-40" />
      <div className="orb orb-blue w-[400px] h-[400px] opacity-15 left-0 bottom-40" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="section-label mb-4">Our Work</p>
          <h2 className="section-title mb-6">
            Projects That{' '}
            <span className="gradient-text">Speak Louder</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            A curated selection of our most impactful digital products — built with precision and purpose.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} inView={inView} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-gray-400 mb-6">Want to see more of our work?</p>
          <button
            id="portfolio-view-more"
            className="btn-secondary"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Let's Discuss Your Project
          </button>
        </div>
      </div>
    </section>
  );
}
