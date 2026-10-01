import { Phone, Mail } from 'lucide-react';
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
                <a
                  href={businessConfig.phoneHref}
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  {businessConfig.phoneNumber}
                </a>
              </li>
              <li>
                <a
                  href={businessConfig.emailHref}
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                  {businessConfig.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-light">Navigate</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#services" className="text-sm text-text-muted hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-text-muted hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#coverage" className="text-sm text-text-muted hover:text-white transition-colors">
                  Coverage
                </a>
              </li>
              <li>
                <a href="#faqs" className="text-sm text-text-muted hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              {businessConfig.privacyUrl && (
                <li>
                  <a
                    href={businessConfig.privacyUrl}
                    className="text-sm text-text-muted hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-divider pt-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-text-muted/60">
              &copy; {new Date().getFullYear()} {businessConfig.name}. All rights reserved.
            </p>
            {businessConfig.companyNumber && (
              <p className="text-xs text-text-muted/60">
                Company No. {businessConfig.companyNumber}
              </p>
            )}
            <p className="text-xs text-text-muted/50">
              Placeholder details — replace before publishing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
