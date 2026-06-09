import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Audit', href: '#audit' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'nav-scrolled' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            aria-label="Polyxos — back to top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <Logo />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg rounded-lg hover:bg-surface/5 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Theme toggle (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => handleNavClick('#contact')}
              className="btn-primary text-sm px-6 py-3"
              id="nav-start-project"
            >
              Start Project
            </button>
          </div>

          {/* Theme toggle + Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface/5 transition-all"
              id="nav-mobile-toggle"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-strong border-t border-app-border/5 mobile-menu-enter">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="text-left px-4 py-3 text-sm font-medium text-fg-muted hover:text-fg rounded-xl hover:bg-surface/5 transition-all"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNavClick('#contact')}
              className="btn-primary text-sm mt-4"
              id="nav-mobile-start"
            >
              Start Project
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
