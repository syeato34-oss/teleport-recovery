import { useEffect, useState } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { BrandLogo } from '@/components/BrandLogo';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Coverage', href: '#coverage' },
  { label: 'FAQs', href: '#faqs' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 ${
        scrolled ? 'site-header--scrolled' : 'site-header--top'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-[72px]">
          {/* Brand */}
          <a href="#top" aria-label={`${businessConfig.name} home`}>
            <BrandLogo />
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="btn-ghost">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop call button */}
          <div className="hidden lg:flex items-center gap-3">
            <a href={businessConfig.phoneHref} className="btn-primary" aria-label={`Call ${businessConfig.phoneNumber}`}>
              <Phone className="h-5 w-5" aria-hidden="true" />
              <span>{businessConfig.phoneNumber}</span>
            </a>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={businessConfig.phoneHref}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-midnight transition-colors hover:bg-accent-light"
              aria-label={`Call ${businessConfig.phoneNumber}`}
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-divider text-text-main"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-b border-divider bg-midnight-2/95 backdrop-blur-md lg:hidden">
          <nav
            id="mobile-navigation"
            className="mx-auto max-w-7xl px-4 py-4 space-y-1"
            aria-label="Mobile"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-text-muted hover:bg-panel hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
