import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { trackEvent } from '@/lib/tracking';

export type LegalPath = '/terms' | '/guarantee' | '/privacy';

const pageTitles: Record<LegalPath, string> = {
  '/terms': 'Terms & Conditions',
  '/guarantee': 'Money-Back Guarantee',
  '/privacy': 'Privacy Policy',
};

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold leading-snug text-white sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function ContactLink({ location }: { location: string }) {
  return (
    <a
      href={businessConfig.phoneHref}
      onClick={() => trackEvent('call_click', { location })}
      aria-label={`Call ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
      className="font-medium text-accent-light underline decoration-accent/40 underline-offset-4 hover:text-white"
    >
      {businessConfig.phoneDisplay}
    </a>
  );
}

function GuaranteePolicy() {
  return (
    <>
      <LegalSection title="When the guarantee applies">
        <p>
          If {businessConfig.tradingName} accepts payment for a booking but is unable to provide
          the agreed recovery service, the amount paid to Teleport for that booking will be refunded.
        </p>
        <p>
          This includes situations where an assigned recovery operator is unable to attend and
          Teleport cannot arrange a suitable replacement within a reasonable timeframe agreed with
          the customer.
        </p>
      </LegalSection>

      <LegalSection title="When the guarantee does not apply">
        <p>The guarantee does not apply where:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-accent-light">
          <li>the service cannot proceed because materially inaccurate or incomplete information was provided;</li>
          <li>the vehicle, location or requested recovery materially differs from the information used to provide the quote;</li>
          <li>the location or recovery is unsafe, inaccessible or unlawful;</li>
          <li>the customer cancels after an operator has been dispatched or work has begun; or</li>
          <li>
            circumstances outside {businessConfig.tradingName}&apos;s reasonable control prevent
            the service from being performed, including police restrictions, road closures or
            severe weather.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Estimated arrival times">
        <p>
          The guarantee concerns {businessConfig.tradingName}&apos;s ability to provide the agreed
          recovery service and does not turn estimated arrival times into guaranteed arrival times.
        </p>
      </LegalSection>

      <LegalSection title="Refunds">
        <p>
          Where the guarantee applies, {businessConfig.tradingName} will initiate the refund to the
          original payment method as soon as reasonably practicable. The time for the funds to
          appear may depend on the customer&apos;s payment provider.
        </p>
        <p>
          To discuss a booking or refund, contact us on <ContactLink location="guarantee_refund" />.
        </p>
      </LegalSection>

      <LegalSection title="Your statutory rights">
        <p>This guarantee is additional to, and does not affect, the customer&apos;s statutory rights.</p>
      </LegalSection>
    </>
  );
}

function BookingTerms() {
  return (
    <>
      <LegalSection title="Your recovery booking">
        <p>
          You purchase your recovery booking from {businessConfig.tradingName}. Teleport manages
          the customer relationship and recovery booking and remains your point of contact.
        </p>
        <p>
          Physical recovery may be carried out by independent recovery operators. You pay Teleport
          for your booking, and Teleport pays recovery operators separately.
        </p>
      </LegalSection>

      <LegalSection title="Quotes and information">
        <p>
          The quote depends on factors such as the vehicle, location, recovery requirements and
          destination. We explain the quote before the booking is arranged so you can decide
          whether to go ahead.
        </p>
        <p>
          Please provide accurate information about your vehicle, its location and condition, the
          destination and any access or safety issues. Tell Teleport promptly if any of these
          details change, so we can discuss whether the agreed recovery can proceed.
        </p>
      </LegalSection>

      <LegalSection title="Arrival estimates and availability">
        <p>
          The {businessConfig.averageEtaMinutes}-minute average ETA shown on this website is based
          on historical recovery experience. It is an average, rather than an arrival promise for
          an individual booking. Actual arrival times can vary by location, traffic and operator
          availability.
        </p>
        <p>Any arrival estimate discussed for your booking is an estimate.</p>
      </LegalSection>

      <LegalSection title="Changes, cancellations and service concerns">
        <p>
          If you need to change or cancel a booking, or have a concern about the service, contact
          Teleport on <ContactLink location="terms_booking" /> as soon as possible. We can discuss
          your booking and the available options.
        </p>
        <p>
          The money-back guarantee has specific conditions, including an exclusion when a customer
          cancels after an operator has been dispatched or work has begun. That exclusion concerns
          the additional guarantee and does not remove any statutory cancellation or refund rights.
        </p>
      </LegalSection>

      <LegalSection title="Money-back guarantee">
        <p>
          If Teleport accepts payment but cannot provide the agreed recovery service, the amount
          paid to Teleport for that booking will be refunded where the guarantee applies. Read the{' '}
          <a
            href={businessConfig.guaranteeUrl}
            className="text-accent-light underline decoration-accent/40 underline-offset-4 hover:text-white"
          >
            full Money-Back Guarantee
          </a>{' '}
          for its scope, exclusions and refund process.
        </p>
      </LegalSection>

      <LegalSection title="Your rights and privacy">
        <p>Nothing in these terms removes or limits your statutory rights.</p>
        <p>
          For information about details supplied through this website, see our{' '}
          <a
            href={businessConfig.privacyUrl}
            className="text-accent-light underline decoration-accent/40 underline-offset-4 hover:text-white"
          >
            Privacy Policy
          </a>.
        </p>
      </LegalSection>
    </>
  );
}

function PrivacyNotice() {
  return (
    <>
      <LegalSection title="Contact and recovery enquiries">
        <p>
          This notice covers information supplied through {businessConfig.tradingName}&apos;s
          website at{' '}
          <a
            href={businessConfig.websiteUrl}
            className="break-words text-accent-light underline decoration-accent/40 underline-offset-4 hover:text-white"
          >
            {businessConfig.websiteUrl}
          </a>.
          For questions about your information, call <ContactLink location="privacy_contact" />.
        </p>
        <p>
          The callback form asks for your name and telephone number. You may also provide a
          location and a short description of what happened. We use these details to respond to
          your recovery request and discuss a possible booking. Please include only information
          relevant to your request, and do not submit payment card details or sensitive personal
          information in the message field.
        </p>
        <p>
          Your telephone number is needed so we can call you back. Location and situation details
          are optional in the form; we may need to discuss them with you to arrange a recovery.
          Submitting a callback request does not sign you up for marketing.
        </p>
      </LegalSection>

      <LegalSection title="How website enquiries are handled">
        <p>
          The website is hosted on Netlify. Callback submissions are sent to Netlify Forms, which
          processes and stores them for Teleport to review. Netlify also processes technical
          information associated with website requests to deliver and protect its hosting and form
          services.
        </p>
        <p>
          If you proceed with a recovery booking, relevant contact, vehicle, location and
          destination details may be shared with the independent recovery operator carrying out
          the physical service. Teleport remains your point of contact for the booking.
        </p>
      </LegalSection>

      <LegalSection title="Website services and analytics">
        <p>
          This website loads its typeface from Google Fonts. Your browser makes requests to Google
          to load those fonts, which involves sharing technical connection information such as
          your IP address.
        </p>
        <p>
          Recovery images are loaded from Pexels. Your browser also shares technical connection
          information with Pexels when requesting these images.
        </p>
        <p>
          This version of the website does not install advertising or analytics tags. If analytics
          or other services are added, the privacy information and any required consent controls
          will need to reflect those services.
        </p>
      </LegalSection>

      <LegalSection title="Retention and further information">
        <p>
          Contact Teleport if you would like information about how long your enquiry or booking
          details are kept, the legal basis for their use, or the service providers involved in
          handling them.
        </p>
      </LegalSection>

      <LegalSection title="Your information rights">
        <p>
          Depending on the circumstances, you may have rights to access your personal information,
          correct it, request its deletion, restrict or object to its use, or receive it in a
          portable format. Where information is used on the basis of consent, you can withdraw
          that consent. To raise a request or a concern, call{' '}
          <ContactLink location="privacy_rights" />.
        </p>
        <p>
          You can also complain to the{' '}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="text-accent-light underline decoration-accent/40 underline-offset-4 hover:text-white"
          >
            Information Commissioner&apos;s Office (ICO)
          </a>.
        </p>
      </LegalSection>
    </>
  );
}

export function LegalPage({ pathname }: { pathname: LegalPath }) {
  const viewedGuarantee = useRef(false);

  useEffect(() => {
    if (pathname === '/guarantee' && !viewedGuarantee.current) {
      viewedGuarantee.current = true;
      trackEvent('guarantee_terms_view', { location: 'guarantee_page' });
    }
  }, [pathname]);

  return (
    <section className="relative overflow-hidden bg-midnight pt-28 pb-16 sm:pt-32 lg:pb-24">
      <div
        className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <a href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-text-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to recovery services
        </a>

        <div className="mt-6">
          <span className="section-label">{businessConfig.tradingName}</span>
          <h1 className="heading-lg mt-3 text-white">{pageTitles[pathname]}</h1>
        </div>

        <nav aria-label="Legal information" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-divider pb-5">
          {(Object.keys(pageTitles) as LegalPath[]).map((path) => (
            <a
              key={path}
              href={path}
              aria-current={pathname === path ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center text-sm transition-colors ${
                pathname === path ? 'font-semibold text-accent-light' : 'text-text-muted hover:text-white'
              }`}
            >
              {pageTitles[path]}
            </a>
          ))}
        </nav>

        <article className="mt-8 space-y-8 rounded-2xl border border-divider bg-panel/30 p-5 text-base leading-relaxed text-text-muted sm:p-8">
          {pathname === '/guarantee' && <GuaranteePolicy />}
          {pathname === '/terms' && <BookingTerms />}
          {pathname === '/privacy' && <PrivacyNotice />}
        </article>

        <a
          href={businessConfig.phoneHref}
          onClick={() => trackEvent('call_click', { location: 'legal_page_footer' })}
          className="btn-secondary mt-8"
          aria-label={`Call ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call {businessConfig.phoneDisplay}
        </a>
      </div>
    </section>
  );
}
