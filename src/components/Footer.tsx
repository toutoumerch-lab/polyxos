import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from './Logo';

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
  const scrollTo = (href: string) => {
    if (href === '#') return;
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-app-border/5 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/40 dark:from-black/60 to-transparent" />
      <div className="orb orb-blue w-[400px] h-[400px] opacity-10 left-1/2 -translate-x-1/2 top-0" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main footer */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Polyxos — back to top"
              className="mb-6"
            >
              <Logo />
            </button>

            <p className="text-fg-subtle text-sm leading-relaxed max-w-xs mb-8">
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
                    className="w-9 h-9 rounded-xl glass border border-app-border/5 flex items-center justify-center text-fg-subtle hover:text-fg hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300"
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
              <h4 className="text-fg font-semibold text-sm mb-6">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-fg-subtle text-sm hover:text-fg transition-colors duration-200 text-left"
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
        <div className="py-6 border-t border-app-border/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-fg-subtle text-sm">
            © {new Date().getFullYear()} Polyxos. All rights reserved.
          </p>
          <p className="text-fg-subtle text-sm flex items-center gap-1">
            Built with <span className="text-red-400">♥</span> by the Polyxos team
          </p>
        </div>
      </div>
    </footer>
  );
}
