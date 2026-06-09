import { useRef, useEffect, useState } from 'react';
import { Search, Lightbulb, Layers, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Lightbulb,
    title: 'Discover',
    description:
      'We dive deep into your business goals, target audience, and requirements to build a comprehensive project foundation.',
    color: '#3B82F6',
  },
  {
    number: '02',
    icon: Search,
    title: 'Design',
    description:
      'Our designers craft stunning wireframes and high-fidelity prototypes that align with your brand and user needs.',
    color: '#8B5CF6',
  },
  {
    number: '03',
    icon: Layers,
    title: 'Develop',
    description:
      'Our engineers build your product with clean, scalable code following best practices and modern architecture patterns.',
    color: '#06B6D4',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Launch',
    description:
      'We deploy, test, and optimize your product for peak performance — then provide ongoing support and iteration.',
    color: '#10B981',
  },
];

export default function Process() {
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
    <section id="process" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="orb orb-cyan w-[400px] h-[400px] opacity-15 left-1/2 -translate-x-1/2 top-0" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="section-label mb-4">How We Work</p>
          <h2 className="section-title mb-6">
            Our{' '}
            <span className="gradient-text">Process</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            A proven four-step methodology that delivers exceptional results, on time and on budget.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981)' }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative flex flex-col items-center text-center transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Icon circle */}
                <div className="relative mb-8 z-10">
                  {/* Pulse rings */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `${step.color}20`,
                      animation: `pulse-ring 3s ease-out ${i * 0.5}s infinite`,
                      transform: 'scale(1.5)',
                    }}
                  />
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center relative"
                    style={{
                      background: `${step.color}15`,
                      border: `2px solid ${step.color}50`,
                      boxShadow: `0 0 30px ${step.color}30`,
                    }}
                  >
                    <Icon size={32} style={{ color: step.color }} />
                  </div>

                  {/* Step number */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: step.color, color: '#fff' }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Content card */}
                <div className="glass rounded-2xl p-6 w-full border border-app-border/5 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg"
                  style={{ '--hover-shadow': `0 20px 40px ${step.color}15` } as React.CSSProperties}
                >
                  <h3 className="font-display text-xl font-bold text-fg mb-3">{step.title}</h3>
                  <p className="text-fg-muted text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
