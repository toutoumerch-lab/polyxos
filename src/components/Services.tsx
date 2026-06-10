import { useRef, useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Globe: LucideIcons.Globe,
  Smartphone: LucideIcons.Smartphone,
  Search: LucideIcons.Search,
  Palette: LucideIcons.Palette,
  Code2: LucideIcons.Code2,
  Cpu: LucideIcons.Cpu,
  Database: LucideIcons.Database,
  Cloud: LucideIcons.Cloud,
  Lock: LucideIcons.Lock,
};

const STATIC_SERVICES = [
  {
    id: 1,
    icon_name: 'Globe',
    title: 'Website Development',
    short_description:
      'High-performance, conversion-optimized websites built with cutting-edge tech stacks. From landing pages to complex web platforms.',
    features: ['React / Next.js', 'SEO Optimized', 'Lightning Fast', 'Responsive Design'],
    color: '#3B82F6',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 2,
    icon_name: 'Smartphone',
    title: 'Mobile App Development',
    short_description:
      'Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.',
    features: ['React Native', 'iOS & Android', 'Offline Support', 'Push Notifications'],
    color: '#8B5CF6',
    gradient: 'from-violet-500/20 to-violet-600/5',
  },
  {
    id: 3,
    icon_name: 'Search',
    title: 'Website Audits',
    short_description:
      'Deep-dive performance, SEO, security, and UX audits with actionable insights to maximize your website\'s potential.',
    features: ['Performance Audit', 'SEO Analysis', 'Security Check', 'UX Review'],
    color: '#06B6D4',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    id: 4,
    icon_name: 'Palette',
    title: 'UI/UX Design',
    short_description:
      'Stunning, user-centered designs that combine aesthetics with function. Figma prototypes to pixel-perfect implementations.',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    color: '#EC4899',
    gradient: 'from-pink-500/20 to-pink-600/5',
  },
  {
    id: 5,
    icon_name: 'Code2',
    title: 'Custom Software Solutions',
    short_description:
      'Tailored software built to solve your unique business challenges — scalable, maintainable, and future-proof.',
    features: ['API Development', 'Microservices', 'Cloud Native', 'CI/CD Pipeline'],
    color: '#F59E0B',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export default function Services() {
  const { ref, inView } = useInView();
  const [services, setServices] = useState<any[]>(STATIC_SERVICES);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setServices(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, []);

  return (
    <section id="services" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="orb orb-blue w-[500px] h-[500px] opacity-20 -left-40 top-20" />
      <div className="orb orb-violet w-[400px] h-[400px] opacity-20 -right-20 bottom-20" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="section-label mb-4">What We Do</p>
          <h2 className="section-title mb-6">
            Services That{' '}
            <span className="gradient-text">Drive Results</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            End-to-end digital solutions crafted by experts who understand both technology and business.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon_name] || LucideIcons.Globe;
            return (
              <div
                key={service.id}
                id={`service-${service.id}`}
                className={`service-card card-hover p-8 group cursor-pointer transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${service.color}20`, border: `1px solid ${service.color}30` }}
                >
                  <Icon size={26} style={{ color: service.color }} />
                </div>

                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {service.short_description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.features.map((f: string) => (
                      <span
                        key={f}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: `${service.color}15`,
                          color: service.color,
                          border: `1px solid ${service.color}30`,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div
                    className="flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                    style={{ color: service.color }}
                  >
                    Learn More <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
