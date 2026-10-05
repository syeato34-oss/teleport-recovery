import { CallLink } from '@/components/CallLink';
import { services } from '@/config/services';
import { Phone } from 'lucide-react';

export function Services() {
  return (
    <section id="services" className="bg-midnight-2 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <span className="section-label">What We Help With</span>
          <h2 className="heading-lg mt-3 text-white">Recovery Services</h2>
          <p className="mt-4 body-base">
            From breakdowns to vehicle transport, tell us what happened and where you need to go.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-xl border border-divider bg-panel/40 p-6 transition-all duration-200 hover:border-accent/30 hover:bg-panel/70"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-divider bg-midnight-2 transition-colors group-hover:border-accent/30">
                <service.icon className="h-6 w-6 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold leading-snug text-white">{service.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-text-muted">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-xl border border-divider bg-panel/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-white">Not sure which service you need?</p>
            <p className="mt-1 text-sm text-text-muted">Call us and we'll help figure it out.</p>
          </div>
          <CallLink location="services" className="btn-primary whitespace-nowrap">
            <Phone className="h-5 w-5" aria-hidden="true" />
            <span>Call to Discuss</span>
          </CallLink>
        </div>
      </div>
    </section>
  );
}
