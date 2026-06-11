import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export default function Contact() {
  const { settings } = useBrand();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const services = [
    'Website Development',
    'Mobile App Development',
    'Website Audit',
    'UI/UX Design',
    'Custom Software',
    'Other',
  ];

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="orb orb-blue w-[500px] h-[500px] opacity-20 -left-40 top-20" />
      <div className="orb orb-violet w-[400px] h-[400px] opacity-20 -right-20 bottom-10" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="section-label mb-4">Get In Touch</p>
          <h2 className="section-title mb-6">
            Ready to Build Your{' '}
            <span className="gradient-text">Next Project?</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Tell us about your idea. We respond within 24 hours with a tailored proposal.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left contact info */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="space-y-6 mb-12">
              {[
                { icon: Mail, label: 'Email Us', value: settings.contact_email || 'hello@polyxos.com', href: `mailto:${settings.contact_email || 'hello@polyxos.com'}` },
                { icon: Phone, label: 'Call Us', value: settings.contact_phone || '+1 (555) 000-0000', href: `tel:${(settings.contact_phone || '+1 (555) 000-0000').replace(/[^\d+]/g, '')}` },
                { icon: MapPin, label: 'Location', value: settings.contact_location || 'Remote — Worldwide', href: '#' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-4 p-5 glass rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
                      <Icon size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                      <p className="text-white font-medium text-sm">{item.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* "Why contact us" mini card */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h4 className="font-display font-bold text-white mb-4">What happens next?</h4>
              <div className="space-y-3">
                {[
                  'We review your project brief within 24 hours',
                  'Schedule a free discovery call with our team',
                  'Receive a detailed proposal and timeline',
                  'Kick off your project with a dedicated team',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-400 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className={`lg:col-span-3 transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="glass-strong rounded-3xl p-8 lg:p-10 border border-white/10 relative overflow-hidden">
              {/* Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-3">Message Received!</h3>
                  <p className="text-gray-400 max-w-sm">
                    We'll get back to you within 24 hours with a tailored response.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-display text-xl font-bold text-white mb-8">Tell Us About Your Project</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                        Your Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="John Smith"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-service" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Service Needed
                    </label>
                    <select
                      id="contact-service"
                      value={formState.service}
                      onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="" style={{ background: '#111' }}>Select a service...</option>
                      {services.map((s) => (
                        <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Project Details *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell us about your project, goals, timeline, and budget..."
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/30 resize-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>

                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-3 group disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <p className="text-center text-xs text-gray-600">
                    No spam, ever. We respond to all inquiries within 24 hours.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
