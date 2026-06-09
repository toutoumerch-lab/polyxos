import { useRef, useEffect, useState } from 'react';
import { Search, TrendingUp, Shield, Zap, CheckCircle2, AlertCircle, Globe } from 'lucide-react';

const auditPoints = [
  {
    icon: Zap,
    title: 'Performance Audit',
    description: 'Core Web Vitals, load time, render-blocking resources, and optimization opportunities.',
    color: '#3B82F6',
  },
  {
    icon: Search,
    title: 'SEO Analysis',
    description: 'Technical SEO, meta tags, structured data, crawlability, and keyword positioning.',
    color: '#8B5CF6',
  },
  {
    icon: Shield,
    title: 'Security Review',
    description: 'Vulnerability scans, SSL checks, CORS policies, and security header analysis.',
    color: '#06B6D4',
  },
  {
    icon: TrendingUp,
    title: 'UX Evaluation',
    description: 'Heatmaps, user flow analysis, conversion bottlenecks, and accessibility checks.',
    color: '#10B981',
  },
];

const deliverables = [
  '40+ Point Audit Report',
  'Priority Fix Recommendations',
  'Competitor Analysis',
  'Action Plan Roadmap',
  'Performance Benchmarks',
  '30-Day Follow Up',
];

export default function AuditCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', website_url: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit audit request.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm text-fg placeholder:text-fg-subtle outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/30';
  const inputStyle = { background: 'rgb(var(--c-surface) / 0.06)', border: '1px solid rgb(var(--c-border) / 0.1)' };

  return (
    <section id="audit" className="py-20 md:py-32 relative overflow-hidden">
      <div className="orb orb-blue w-[600px] h-[600px] opacity-20 -right-40 top-10" />
      <div className="orb orb-violet w-[400px] h-[400px] opacity-15 -left-20 bottom-10" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main card */}
        <div className={`glass-strong rounded-3xl p-6 sm:p-10 lg:p-16 border border-app-border/10 overflow-hidden relative transition-all duration-700 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Gradient accent top */}
          <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />

          {/* Floating orbs inside card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-start">
            {/* Left — Info + Form */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6"
                style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <Search size={12} />
                Free Website Audit
              </div>

              <h2 className="section-title mb-6">
                Is Your Website{' '}
                <span className="gradient-text">Losing Money?</span>
              </h2>

              <p className="section-subtitle mb-8">
                Get a comprehensive audit that uncovers hidden performance issues, SEO gaps, security vulnerabilities, and UX flaws killing your conversions.
              </p>

              {/* Deliverables */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {deliverables.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-fg-muted text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* ─── Audit Request Form ─────────────────────────────────── */}
              {submitted ? (
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-fg mb-1">Audit Request Received!</p>
                    <p className="text-fg-muted text-sm">We'll begin your website audit within 48 hours and send the full report to your inbox.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="audit-name" className="block text-xs font-semibold text-fg-subtle mb-1.5 uppercase tracking-wide">
                        Your Name *
                      </label>
                      <input
                        id="audit-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Smith"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="audit-email" className="block text-xs font-semibold text-fg-subtle mb-1.5 uppercase tracking-wide">
                        Email *
                      </label>
                      <input
                        id="audit-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@company.com"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="audit-url" className="block text-xs font-semibold text-fg-subtle mb-1.5 uppercase tracking-wide">
                      Website URL *
                    </label>
                    <div className="relative">
                      <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
                      <input
                        id="audit-url"
                        type="text"
                        required
                        value={form.website_url}
                        onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                        placeholder="yourwebsite.com"
                        className={`${inputClass} pl-9`}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    id="audit-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Request Free Audit
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right — Audit points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {auditPoints.map((point, i) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className={`rounded-2xl p-6 border transition-all duration-500 hover:-translate-y-1 group ${
                      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{
                      background: `${point.color}10`,
                      border: `1px solid ${point.color}25`,
                      transitionDelay: `${200 + i * 100}ms`,
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: `${point.color}20` }}
                    >
                      <Icon size={22} style={{ color: point.color }} />
                    </div>
                    <h4 className="font-display font-bold text-fg text-sm mb-2">{point.title}</h4>
                    <p className="text-fg-muted text-xs leading-relaxed">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
