import { useState, type FormEvent } from 'react';
import { Phone, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { businessConfig } from '@/config/business';

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // VISUAL PLACEHOLDER ONLY — no backend is connected.
    // Do not present this as a working submission to visitors.
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative bg-midnight-2 py-20 lg:py-28 overflow-hidden">
      {/* Decorative gradient accent */}
      <div
        className="absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Call to action */}
          <div>
            <span className="section-label">Get Help Now</span>
            <h2 className="heading-lg mt-3 text-white">Call for Recovery</h2>
            <p className="mt-4 body-lg">
              The fastest way to get help is to call us directly. Tell us where you are and what
              happened — we'll take it from there.
            </p>

            {/* Phone CTA */}
            <div className="mt-8 space-y-3">
              <a
                href={businessConfig.phoneHref}
                className="flex items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 px-6 py-5 transition-all hover:border-accent/50 hover:bg-accent/15"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-midnight">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.15em] text-accent-light">Call now</span>
                    <span className="block text-xl font-bold text-white">{businessConfig.phoneNumber}</span>
                  </span>
                </span>
              </a>

              <a
                href={businessConfig.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-xl border border-divider bg-panel/40 px-6 py-5 transition-all hover:border-accent/30"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-divider bg-midnight-2 text-accent-light">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.15em] text-text-muted">WhatsApp</span>
                    <span className="block text-base font-semibold text-white">{businessConfig.whatsappNumber}</span>
                  </span>
                </span>
              </a>
            </div>

            <p className="mt-6 text-sm text-text-muted/70">
              Prefer we call you back? Fill in the form and we'll get in touch. This is optional —
              calling is always faster.
            </p>
          </div>

          {/* Right: Callback form (VISUAL PLACEHOLDER) */}
          <div className="rounded-2xl border border-divider bg-panel/40 p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Request a Callback</h3>
              <p className="mt-1.5 text-sm text-text-muted">
                Leave your details and we'll call you back to discuss your situation.
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden="true" />
                <p className="mt-4 text-base font-semibold text-white">Details noted</p>
                <p className="mt-1.5 text-sm text-text-muted max-w-xs">
                  For immediate help, please call us directly. This form is a visual placeholder and
                  does not yet send messages.
                </p>
                <a href={businessConfig.phoneHref} className="btn-primary mt-6">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Call Instead
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="cb-name" className="block text-sm font-medium text-text-muted mb-1.5">
                    Your name
                  </label>
                  <input
                    id="cb-name"
                    type="text"
                    autoComplete="name"
                    className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:border-accent/50"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label htmlFor="cb-phone" className="block text-sm font-medium text-text-muted mb-1.5">
                    Phone number
                  </label>
                  <input
                    id="cb-phone"
                    type="tel"
                    autoComplete="tel"
                    className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:border-accent/50"
                    placeholder="07xxx xxx xxx"
                  />
                </div>
                <div>
                  <label htmlFor="cb-location" className="block text-sm font-medium text-text-muted mb-1.5">
                    Your location <span className="text-text-muted/50">(optional)</span>
                  </label>
                  <input
                    id="cb-location"
                    type="text"
                    className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:border-accent/50"
                    placeholder="Postcode or nearby landmark"
                  />
                </div>
                <div>
                  <label htmlFor="cb-message" className="block text-sm font-medium text-text-muted mb-1.5">
                    What happened? <span className="text-text-muted/50">(optional)</span>
                  </label>
                  <textarea
                    id="cb-message"
                    rows={3}
                    className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:border-accent/50 resize-none"
                    placeholder="Brief description of the situation"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Request Callback
                </button>
                <p className="text-center text-xs text-text-muted/50">
                  This form is a visual placeholder. For immediate help, please call.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
