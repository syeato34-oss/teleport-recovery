import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Phone, Send, CheckCircle2 } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { CALLBACK_FORM_NAME, isCallbackPhoneValid, submitCallback } from '@/lib/callback';
import { trackEvent } from '@/lib/tracking';
import { WhatsAppLocationButton } from '@/components/WhatsAppLocationButton';

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
    if (failed) errorRef.current?.focus();
  }, [submitted, failed]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current || submitted) return;

    const form = e.currentTarget;
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const phone = form.elements.namedItem('phone') as HTMLInputElement;
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name.');
    phone.setCustomValidity(
      isCallbackPhoneValid(phone.value) ? '' : 'Please enter a valid phone number with 7 to 15 digits.',
    );
    if (!form.reportValidity()) return;

    // A ref locks immediately, before React has rendered the disabled button.
    inFlight.current = true;
    setBusy(true);
    setFailed(false);
    const formData = new FormData(form);

    try {
      await submitCallback(formData);
      setSubmitted(true);
      trackEvent('callback_submit', { location: 'contact' });
    } catch {
      // A timeout may occur after the server receives a request: never claim it
      // definitely failed to arrive or report success without confirmation.
      setFailed(true);
      inFlight.current = false;
    } finally {
      setBusy(false);
    }
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
            <h2 className="heading-lg mt-3 text-white">Let’s arrange your recovery.</h2>
            <p className="mt-4 body-lg">
              Call with your pickup location and destination — we’ll confirm the price and ETA.
            </p>

            {/* Phone CTA */}
            <div className="mt-8 space-y-3">
              <a
                href={businessConfig.phoneHref}
                aria-label={`Call ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
                onClick={() => trackEvent('call_click', { location: 'contact' })}
                className="btn-primary w-full justify-start rounded-xl px-5 py-5 sm:px-6"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-midnight/10 text-midnight">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.15em] text-midnight/80">Call now</span>
                    <span className="block whitespace-nowrap text-[clamp(1.5rem,6.5vw,2.25rem)] font-extrabold leading-tight tracking-tight text-midnight sm:text-4xl xl:text-[2.75rem]">
                      {businessConfig.phoneDisplay}
                    </span>
                  </span>
                </span>
              </a>
              <WhatsAppLocationButton
                location="contact"
                className="min-h-[58px] w-full rounded-xl px-5 text-base font-semibold"
              />
            </div>
          </div>

          {/* Right: Callback form */}
          <div className="rounded-2xl border border-divider bg-panel/40 p-6 sm:p-8">
            <div className="mb-6">
              <h3 id="callback-title" className="text-xl font-semibold text-white">Prefer a callback?</h3>
              <p className="mt-1.5 text-sm text-text-muted">
                Leave your details and we'll call you back to discuss your situation.
              </p>
            </div>

            {submitted ? (
              <div ref={successRef} tabIndex={-1} role="status" aria-live="polite" className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden="true" />
                <p className="mt-4 text-base font-semibold text-white">Callback requested</p>
                <p className="mt-1.5 text-sm text-text-muted max-w-xs">
                  We've received your details and will call you back to discuss your recovery request.
                  For immediate help, please call us directly.
                </p>
                <a
                  href={businessConfig.phoneHref}
                  aria-label={`Call ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
                  onClick={() => trackEvent('call_click', { location: 'callback_success' })}
                  className="btn-primary mt-6"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Call Instead
                </a>
              </div>
            ) : (
              <form
                name={CALLBACK_FORM_NAME}
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                aria-labelledby="callback-title"
                aria-describedby="callback-privacy"
                aria-busy={busy}
                className="space-y-4"
              >
                <input type="hidden" name="form-name" value={CALLBACK_FORM_NAME} />
                <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                  <label>
                    Leave this field empty
                    <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <fieldset disabled={busy} aria-label="Callback request details" className="min-w-0 space-y-4">
                  <div>
                    <label htmlFor="cb-name" className="block text-sm font-medium text-text-muted mb-1.5">
                      Your name
                    </label>
                    <input
                      id="cb-name"
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      autoComplete="name"
                      onInput={(event) => event.currentTarget.setCustomValidity('')}
                      className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/70 focus:border-accent/50"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="cb-phone" className="block text-sm font-medium text-text-muted mb-1.5">
                      Phone number
                    </label>
                    <input
                      id="cb-phone"
                      name="phone"
                      type="tel"
                      required
                      minLength={7}
                      maxLength={30}
                      autoComplete="tel"
                      inputMode="tel"
                      aria-describedby="cb-phone-hint"
                      onInput={(event) => event.currentTarget.setCustomValidity('')}
                      className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/70 focus:border-accent/50"
                      placeholder="Your callback number"
                    />
                    <p id="cb-phone-hint" className="mt-1.5 text-xs text-text-muted">
                      Include the country code if you're outside the UK.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="cb-location" className="block text-sm font-medium text-text-muted mb-1.5">
                      Your location <span className="text-text-muted/80">(optional)</span>
                    </label>
                    <input
                      id="cb-location"
                      name="location"
                      type="text"
                      maxLength={200}
                      className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/70 focus:border-accent/50"
                      placeholder="Postcode or nearby landmark"
                    />
                  </div>
                  <div>
                    <label htmlFor="cb-message" className="block text-sm font-medium text-text-muted mb-1.5">
                      What happened? <span className="text-text-muted/80">(optional)</span>
                    </label>
                    <textarea
                      id="cb-message"
                      name="details"
                      rows={3}
                      maxLength={2000}
                      className="w-full rounded-lg border border-divider bg-midnight-2 px-4 py-3 text-sm text-white placeholder:text-text-muted/70 focus:border-accent/50 resize-none"
                      placeholder="Brief description of the situation"
                    />
                  </div>
                  <button type="submit" disabled={busy} className="btn-secondary w-full disabled:cursor-wait disabled:opacity-70">
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {busy ? 'Sending callback request…' : 'Request Callback'}
                  </button>
                </fieldset>
                {failed && (
                  <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg border border-accent/30 bg-midnight-2 p-3 text-sm text-text-main">
                    We couldn't confirm your callback request. Please{' '}
                    <a
                      href={businessConfig.phoneHref}
                      onClick={() => trackEvent('call_click', { location: 'callback_failure' })}
                      className="text-accent-light underline underline-offset-4"
                    >
                      call {businessConfig.phoneDisplay}
                    </a>{' '}
                    for immediate help, or try again.
                  </p>
                )}
                <p aria-live="polite" className="sr-only">{busy ? 'Sending callback request.' : ''}</p>
                <p id="callback-privacy" className="text-center text-xs leading-relaxed text-text-muted">
                  We'll use these details to respond to your recovery request. See our{' '}
                  <a href={businessConfig.privacyUrl} className="text-accent-light underline underline-offset-4">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
