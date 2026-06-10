import { useRef, useEffect, useState } from 'react';
import { ExternalLink, Search, Github, X, RefreshCw } from 'lucide-react';

const STATIC_PROJECTS = [
  {
    id: 1,
    title: 'FinPulse Dashboard',
    category: 'Web Application',
    description: 'Real-time financial analytics platform with AI-powered insights and interactive data visualizations.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    cover_image: 'mock-finpulse',
    live_url: '#',
    github_url: '#',
    featured: true,
  },
  {
    id: 2,
    title: 'ShopNova Mobile',
    category: 'Mobile App',
    description: 'Cross-platform e-commerce app with AR product preview, seamless checkout, and real-time order tracking.',
    tags: ['React Native', 'Express.js', 'Stripe'],
    cover_image: 'mock-shopnova',
    live_url: '#',
    github_url: '#',
    featured: false,
  },
  {
    id: 3,
    title: 'Orion SaaS Platform',
    category: 'Custom Software',
    description: 'Enterprise project management suite with team collaboration, automated workflows, and advanced reporting.',
    tags: ['Next.js', 'Docker', 'PostgreSQL'],
    cover_image: 'mock-orion',
    live_url: '#',
    github_url: '#',
    featured: false,
  },
  {
    id: 4,
    title: 'Luxe Brand Identity',
    category: 'UI/UX Design',
    description: 'Complete brand identity and design system for a luxury fashion brand, including web and mobile touchpoints.',
    tags: ['Figma', 'Design System', 'Branding'],
    cover_image: 'mock-luxe',
    live_url: '#',
    github_url: '#',
    featured: false,
  },
  {
    id: 5,
    title: 'MediTrack Pro',
    category: 'Mobile App',
    description: 'HIPAA-compliant healthcare management app connecting patients, doctors, and pharmacies in one ecosystem.',
    tags: ['React Native', 'Node.js', 'MongoDB'],
    cover_image: 'mock-meditrack',
    live_url: '#',
    github_url: '#',
    featured: false,
  },
  {
    id: 6,
    title: 'DataSphere Analytics',
    category: 'Web Application',
    description: 'Advanced marketing analytics platform with predictive modeling and multi-channel attribution tracking.',
    tags: ['React', 'D3.js', 'Python'],
    cover_image: 'mock-datasphere',
    live_url: '#',
    github_url: '#',
    featured: false,
  },
];

const mockGradients: Record<string, { grad: string; accent: string; bg: string }> = {
  'mock-finpulse': { grad: 'from-blue-600 via-blue-500 to-cyan-400', accent: '#3B82F6', bg: 'from-slate-900 to-blue-950' },
  'mock-shopnova': { grad: 'from-violet-600 via-purple-500 to-pink-400', accent: '#8B5CF6', bg: 'from-slate-900 to-violet-950' },
  'mock-orion': { grad: 'from-cyan-500 via-teal-400 to-emerald-400', accent: '#06B6D4', bg: 'from-slate-900 to-cyan-950' },
  'mock-luxe': { grad: 'from-pink-500 via-rose-500 to-orange-400', accent: '#EC4899', bg: 'from-slate-900 to-pink-950' },
  'mock-meditrack': { grad: 'from-emerald-500 via-green-400 to-teal-400', accent: '#10B981', bg: 'from-slate-900 to-emerald-950' },
  'mock-datasphere': { grad: 'from-amber-500 via-yellow-500 to-orange-400', accent: '#F59E0B', bg: 'from-slate-900 to-amber-950' },
};

function ProjectCard({ project, index, inView }: { project: any; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  // Check if it's a mock visual or real uploaded file
  const isMock = !project.cover_image || project.cover_image.startsWith('mock-');
  const mockConfig = mockGradients[project.cover_image] || mockGradients['mock-finpulse'];
  const accentColor = project.featured ? '#8B5CF6' : (mockConfig?.accent || '#3B82F6');

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
      {/* Visual mockup or uploaded cover image */}
      <div className="h-52 relative overflow-hidden bg-slate-950">
        {!isMock ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${mockConfig.bg} relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${mockConfig.grad} opacity-20`} />
            <div className="absolute inset-4 glass rounded-xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full mx-2" />
              </div>
              <div className="p-3 space-y-2">
                <div className={`h-3 rounded-full w-2/3 bg-gradient-to-r ${mockConfig.grad} opacity-60`} />
                <div className="h-2 rounded-full w-full bg-white/10" />
                <div className="h-2 rounded-full w-4/5 bg-white/10" />
              </div>
            </div>
          </div>
        )}

        {/* Hover overlay with CTA */}
        <div className={`overlay transition-all duration-400 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold" style={{ color: accentColor }}>{project.category}</p>
              <p className="text-white font-bold text-sm">{project.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border border-white/10 hover:bg-black/60 transition-colors"
                >
                  <Github size={14} className="text-white" />
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  style={{ background: accentColor }}
                >
                  <ExternalLink size={14} className="text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: accentColor }}>{project.category}</p>
            <h3 className="font-display text-lg font-bold text-white">{project.title}</h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}
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
  const [projects, setProjects] = useState<any[]>(STATIC_PROJECTS);

  // Filters state
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce search text
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category !== 'All') queryParams.append('category', category);
        if (debouncedSearch) queryParams.append('search', debouncedSearch);

        const res = await fetch(`/api/portfolio?${queryParams.toString()}`);
        const data = await res.json();
        // If data is empty and we had no filter/search, fallback to static defaults
        if (data.success && data.data && (data.data.length > 0 || category !== 'All' || debouncedSearch)) {
          setProjects(data.data);
        } else if (!debouncedSearch && category === 'All') {
          setProjects(STATIC_PROJECTS);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [category, debouncedSearch]);

  const categories = ['All', 'Web Application', 'Mobile App', 'Custom Software', 'UI/UX Design'];

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden">
      <div className="orb orb-violet w-[500px] h-[500px] opacity-15 right-0 top-40" />
      <div className="orb orb-blue w-[400px] h-[400px] opacity-15 left-0 bottom-40" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="section-label mb-4">Our Work</p>
          <h2 className="section-title mb-6">
            Projects That{' '}
            <span className="gradient-text">Speak Louder</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            A curated selection of our most impactful digital products — built with precision and purpose.
          </p>
        </div>

        {/* Filters and search UI */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-12 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 glass border border-white/5 rounded-2xl w-full md:w-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  category === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white/3 hover:bg-white/5 focus:bg-white/5 border border-white/8 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            {loading ? (
              <RefreshCw size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
            ) : search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} inView={inView} />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            No projects found matching current criteria.
          </div>
        )}

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
