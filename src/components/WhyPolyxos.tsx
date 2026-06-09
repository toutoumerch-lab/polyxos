import { useRef, useEffect, useState } from 'react';
import { Zap, Clock, TrendingUp, Users, Shield, Sparkles } from 'lucide-react';

const reasons = [
  {
    icon: Zap,
    title: 'Modern Technologies',
    description: 'We use the latest, battle-tested tech stacks to build fast, reliable, and future-proof products.',
    color: '#3B82F6',
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Agile development sprints with transparent timelines. We ship on schedule without cutting corners.',
    color: '#8B5CF6',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Solutions',
    description: 'Architecture designed to grow with your business — from MVP to enterprise scale seamlessly.',
    color: '#06B6D4',
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Seasoned engineers, designers, and strategists who have shipped products for global brands.',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Every product we build follows security best practices and compliance standards from day one.',
    color: '#F59E0B',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'We don\'t ship average. Every pixel, every line of code meets our high bar for excellence.',
    color: '#EC4899',
  },
];

export default function WhyPolyxos() {
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
    <section id="why-us" className="py-32 relative overflow-hidden">
      {/* Dark gradient band */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
      <div className="orb orb-blue w-[500px] h-[500px] opacity-15 left-1/2 -translate-x-1/2 top-10" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left content */}
          <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <p className="section-label mb-4">Why Choose Us</p>
            <h2 className="section-title mb-6">
              Built by Experts,{' '}
              <br />
              <span className="gradient-text">Delivered with Passion</span>
            </h2>
            <p className="section-subtitle mb-8">
              We're not just developers — we're product thinkers, design enthusiasts, and strategic partners committed to your success.
            </p>

            {/* Big stat */}
            <div className="flex gap-10 mb-10">
              {[
                { value: '150+', label: 'Happy Clients' },
                { value: '98%', label: 'On-Time Delivery' },
                { value: '5★', label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-4xl font-black gradient-text mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <button
              id="why-start-project"
              className="btn-primary"
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Project
            </button>
          </div>

          {/* Right grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className={`glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 group ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${200 + i * 80}ms` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${reason.color}20` }}
                  >
                    <Icon size={20} style={{ color: reason.color }} />
                  </div>
                  <h4 className="font-display font-bold text-white text-sm mb-2">{reason.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
