import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ContactCTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 gradient-bg opacity-90" style={{ backgroundSize: '300%', animation: 'gradient 8s ease infinite' }} />
          
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Floating circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 px-8 py-16 lg:px-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              <Sparkles size={14} />
              Limited Spots Available
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Ready to Build Something <br className="hidden md:block" />
              <span className="text-white/80">Extraordinary?</span>
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              Join 150+ businesses who trusted Polyxos to turn their vision into a product that drives real growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                id="cta-banner-start"
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl flex items-center gap-2 justify-center hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Your Project
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                id="cta-banner-audit"
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                onClick={() => document.querySelector('#audit')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Free Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
