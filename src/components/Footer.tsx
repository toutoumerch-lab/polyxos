import { useState, useEffect } from 'react';
import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

const footerLinks = {
  Services: [
    { label: 'Website Development', href: '#services' },
    { label: 'Mobile Apps', href: '#services' },
    { label: 'Website Audits', href: '#audit' },
    { label: 'UI/UX Design', href: '#services' },
    { label: 'Custom Software', href: '#services' },
  ],
  Company: [
    { label: 'About Us', href: '#why-us' },
    { label: 'Our Process', href: '#process' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Technologies', href: '#technologies' },
    { label: 'Contact', href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

const socials = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
  const { logoUrl } = useBrand();
  const [logoError, setLogoError] = useState(false);
  useEffect(() => { setLogoError(false); }, [logoUrl]);

  const scrollTo = (href: string) => {
    if (href === '#') return;
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/5 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="orb orb-blue w-[400px] h-[400px] opacity-10 left-1/2 -translate-x-1/2 top-0" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main footer */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 mb-6 group"
            >
              {logoUrl && !logoError ? (
                <img src={logoUrl} alt="Polyxos" className="h-9 w-auto object-contain" onError={() => setLogoError(true)} />
              ) : (
                <>
                  <div className="relative w-9 h-9">
                    <div className="absolute inset-0 rounded-lg gradient-bg opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg font-display">
                      P
                    </div>
                    <div className="absolute -inset-1 rounded-xl gradient-bg opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
                  </div>
                  <span className="font-display text-xl font-bold text-white">
                    Poly<span className="gradient-text">xos</span>
                  </span>
                </>
              )}
            </button>

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
              We Build Everything in Your Mind. Premium technology agency transforming bold ideas into exceptional digital products.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl glass border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-6">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-gray-500 text-sm hover:text-white transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Polyxos. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            Built with <span className="text-red-400">♥</span> by the Polyxos team
          </p>
        </div>
      </div>
    </footer>
  );
}
