import { CallLink } from '@/components/CallLink';
import { Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { BrandLogo } from '@/components/BrandLogo';

export function Footer() {
  return (
    <footer className="border-t border-divider bg-midnight">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              We help arrange vehicle recovery across the UK. Contact us with your location and
              situation, and we'll discuss the available options.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-light">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <CallLink location="footer"
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  {businessConfig.phoneDisplay}
                </CallLink>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-light">Navigate</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/#services" className="text-sm text-text-muted hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="text-sm text-text-muted hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#coverage" className="text-sm text-text-muted hover:text-white transition-colors">
                  Coverage
                </a>
              </li>
              <li>
                <a href="/#faqs" className="text-sm text-text-muted hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-divider pt-6">
          <nav aria-label="Legal" className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
            <a href={businessConfig.termsUrl} className="inline-flex min-h-11 items-center hover:text-white">Terms &amp; Conditions</a>
            <a href={businessConfig.guaranteeUrl} className="inline-flex min-h-11 items-center hover:text-white">Money-Back Guarantee</a>
            <a href={businessConfig.privacyUrl} className="inline-flex min-h-11 items-center hover:text-white">Privacy Policy</a>
          </nav>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-text-muted/60">
              &copy; {new Date().getFullYear()} {businessConfig.tradingName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
