import { CallLink } from '@/components/CallLink';
import { Phone } from 'lucide-react';

const steps = [
  {
    title: 'Call us',
    text: 'Tell us where you are and what happened.',
  },
  {
    title: 'Quote & confirm',
    text: 'We explain the recovery option, price and ETA before dispatch.',
  },
  {
    title: 'Recovery arranged',
    text: 'Once agreed, we arrange your recovery.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-midnight py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="section-label">Simple Process</span>
          <h2 className="heading-lg mt-3 text-white">How It Works</h2>
          <p className="mt-4 body-base max-w-2xl mx-auto">
            Three straightforward steps from stranded to sorted.
          </p>
        </div>

        <ol className="mx-auto max-w-5xl md:grid md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-5 pb-10 last:pb-0 md:block md:pb-0 md:text-center">
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-1.75rem] left-7 top-7 w-px bg-accent/35 md:bottom-auto md:left-1/2 md:h-px md:w-full"
                />
              )}
              <span aria-hidden="true" className="relative flex h-14 w-14 items-center justify-center rounded-full border border-accent/60 bg-midnight text-lg font-semibold tabular-nums tracking-wide text-accent-light md:mx-auto">
                0{i + 1}
              </span>
              <div className="pt-1 md:mt-6 md:px-4 md:pt-0">
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted md:mx-auto md:max-w-[18rem]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Inline CTA */}
        <div className="mt-12 flex justify-center">
          <CallLink location="howitworks" className="btn-primary">
            <Phone className="h-5 w-5" aria-hidden="true" />
            <span>Call to Get Started</span>
          </CallLink>
        </div>
      </div>
    </section>
  );
}
