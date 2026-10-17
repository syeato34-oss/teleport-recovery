import { useId, useState } from 'react';
import { ChevronDown, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { LocationPageConfig } from '@/config/locations';
import { CallLink } from '@/components/CallLink';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { CallbackSection } from '@/components/ContactSection';

const recoveryImage = 'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb';

function LocationActions({ page, placement }: { page: LocationPageConfig; placement: 'hero' | 'final_cta' }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <CallLink location={`${page.slug}_${placement}`} className="btn-primary hero-call-cta min-h-[58px] text-lg font-bold">
        <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 break-words">Call {businessConfig.phoneDisplay}</span>
      </CallLink>
      <WhatsAppLink location={`${page.slug}_${placement}`} message={page.whatsappMessage} className="btn-secondary min-h-[58px] text-base font-semibold">
        WhatsApp for a Quote
      </WhatsAppLink>
    </div>
  );
}

function LocationCoverage({ page }: { page: LocationPageConfig }) {
  const [expanded, setExpanded] = useState(false);
  const extraAreasId = useId();
  const { coverage } = page;
  const areaList = (areas: readonly string[]) => (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm leading-relaxed text-text-muted sm:text-base lg:grid-cols-4">
      {areas.map((area) => <li key={area} className="min-w-0 break-words border-l-2 border-accent/40 pl-3">{area}</li>)}
    </ul>
  );
  return (
    <section aria-labelledby="location-coverage-heading" className="bg-midnight-2 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="section-label">Pickup locations</p>
        <h2 id="location-coverage-heading" className="heading-lg mt-3 max-w-3xl break-words text-white">{coverage.heading}</h2>
        <p className="body-base mt-4 max-w-3xl">{coverage.introduction}</p>
        <div className="mt-7">{areaList(coverage.areas.slice(0, coverage.initialCount))}</div>
        <div id={extraAreasId} hidden={!expanded}>
          <div className="mt-3">{areaList(coverage.areas.slice(coverage.initialCount))}</div>
        </div>
        {coverage.areas.length > coverage.initialCount && (
          <button type="button" aria-expanded={expanded} aria-controls={extraAreasId} onClick={() => setExpanded(!expanded)} className="btn-secondary mt-6">
            {expanded ? 'View fewer areas' : 'View more areas'}
            <ChevronDown className={`h-5 w-5 shrink-0 text-accent-light ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-text-muted">Availability is checked for your specific pickup and vehicle. A listed area does not promise immediate recovery or a local depot.</p>
      </div>
    </section>
  );
}

function LocationFAQs({ page }: { page: LocationPageConfig }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const id = useId();
  return (
    <section aria-labelledby="location-faq-heading" className="bg-midnight py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="section-label">Before you book</p>
        <h2 id="location-faq-heading" className="heading-lg mt-3 break-words text-white">{page.city} recovery questions</h2>
        <div className="mt-7 space-y-3">
          {page.faqs.map((faq, index) => {
            const expanded = openIndex === index;
            const triggerId = `${id}-trigger-${index}`;
            const panelId = `${id}-panel-${index}`;
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-divider bg-panel/30">
                <h3>
                  <button id={triggerId} type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpenIndex(expanded ? null : index)} className="flex min-h-[52px] w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="min-w-0 break-words text-base font-semibold text-white">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-accent-light ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!expanded}>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">
                    {faq.answer}
                    {faq.link && <>{' '}<a href={faq.link.href} className="text-accent-light underline underline-offset-4">{faq.link.label}</a></>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** One city template; contacts, forms, legal links and fixed UI remain shared. */
export function LocationPage({ page }: { page: LocationPageConfig }) {
  return (
    <>
      <section className="relative overflow-hidden bg-midnight pb-12 pt-24 sm:pt-28 lg:py-32">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={`${recoveryImage}&w=1920`}
            srcSet={`${recoveryImage}&w=900 900w, ${recoveryImage}&w=1920 1920w`}
            sizes="100vw"
            alt=""
            className="h-full w-full object-cover object-center"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-image-shade absolute inset-0" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-label">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {page.label}
            </p>
            <h1 className="heading-xl mt-4 break-words text-white">{page.heading}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">{page.summary}</p>
            <LocationActions page={page} placement="hero" />
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-text-muted">{page.trust.join(' · ')}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="location-services-heading" className="bg-midnight-2 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="section-label">Recovery & transport</p>
          <h2 id="location-services-heading" className="heading-lg mt-3 break-words text-white">Help for your vehicle in {page.city}</h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
            {page.services.map((service) => (
              <article key={service.id} className={`min-w-0 rounded-xl border p-5 sm:p-6 ${service.id === 'emergency' ? 'border-accent/60 bg-accent/5' : 'border-divider bg-panel/30'}`}>
                <h3 className="break-words text-xl font-semibold text-white">{service.heading}</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-text-muted marker:text-accent-light">
                  {service.items.map((item) => <li key={item} className="break-words">{item}</li>)}
                </ul>
                <p className="mt-4 break-words text-sm leading-relaxed text-text-muted">{service.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="location-process-heading" className="bg-midnight py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="section-label">How it works</p>
          <h2 id="location-process-heading" className="heading-lg mt-3 text-white">From enquiry to recovery</h2>
          <ol className="mt-7 grid gap-6 lg:grid-cols-3">
            {[
              { heading: 'Tell us the journey', text: 'Tell us your location, destination and vehicle.' },
              { heading: 'Check availability & price', text: 'We check suitable operator availability and provide a quote and estimated arrival time.' },
              { heading: 'Agree your booking', text: 'Once the booking is agreed, we coordinate the recovery.' },
            ].map((step, index) => (
              <li key={step.heading} className="flex min-w-0 gap-4">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/60 bg-accent/10 font-semibold text-accent-light">{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-semibold text-white">{step.heading}</h3>
                  <p className="mt-2 break-words text-base leading-relaxed text-text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-midnight-2 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="heading-lg break-words text-white">Arranging recovery in {page.city}</h2>
          <p className="body-base mt-4 max-w-3xl">{page.introduction}</p>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {page.details.map((detail) => (
              <div key={detail.heading} className="min-w-0">
                <h3 className="break-words text-xl font-semibold text-white">{detail.heading}</h3>
                <p className="mt-3 break-words text-base leading-relaxed text-text-muted">{detail.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-7 max-w-3xl border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-text-muted">
            {page.availabilityNote}
          </p>
          <aside aria-labelledby="location-guarantee-heading" className="mt-7 flex max-w-3xl gap-4 rounded-xl border border-divider bg-panel/30 p-5">
            <ShieldCheck className="h-6 w-6 shrink-0 text-accent-light" aria-hidden="true" />
            <div className="min-w-0">
              <h3 id="location-guarantee-heading" className="text-lg font-semibold text-white">Money-back guarantee — conditions apply</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">If Teleport accepts payment but cannot provide the agreed recovery service, the amount paid for that booking is refunded where the published guarantee applies. Eligibility and exclusions apply; estimated arrival times are not guaranteed.</p>
              <a href={businessConfig.guaranteeUrl} className="mt-3 inline-flex min-h-11 items-center text-sm text-accent-light underline underline-offset-4">Read eligibility, exclusions and refund details</a>
            </div>
          </aside>
        </div>
      </section>

      <CallbackSection />

      <LocationCoverage page={page} />
      <LocationFAQs page={page} />

      <section className="bg-midnight-2 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="heading-lg break-words text-white">Discuss your {page.city} recovery</h2>
          <p className="body-lg mt-4 max-w-xl">Tell us your pickup and destination. We’ll check availability and explain the quote before you book.</p>
          <LocationActions page={page} placement="final_cta" />
          <p className="mt-6 text-sm text-text-muted">
            Read our{' '}
            <a href={businessConfig.termsUrl} className="text-accent-light underline underline-offset-4">booking terms</a>{' '}
            or view our{' '}
            <a href="/" className="text-accent-light underline underline-offset-4">nationwide recovery services</a>.
          </p>
        </div>
      </section>
    </>
  );
}
