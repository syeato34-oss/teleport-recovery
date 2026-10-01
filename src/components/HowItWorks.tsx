import { Phone, ClipboardList, Truck } from 'lucide-react';
import { businessConfig } from '@/config/business';

const steps = [
  {
    icon: Phone,
    title: 'Call us',
    text: 'Tell us where you are and what happened.',
  },
  {
    icon: ClipboardList,
    title: 'Discuss the job',
    text: 'Explain the vehicle, destination and help you need.',
  },
  {
    icon: Truck,
    title: 'Arrange recovery',
    text: 'Hear the quote and decide whether to go ahead.',
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

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="relative rounded-xl border border-divider bg-panel/40 p-7 text-center transition-colors hover:border-accent/30">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-divider bg-midnight-2">
                  <step.icon className="h-7 w-7 text-accent" aria-hidden="true" />
                </div>
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-accent-light">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inline CTA */}
        <div className="mt-12 flex justify-center">
          <a href={businessConfig.phoneHref} className="btn-primary">
            <Phone className="h-5 w-5" aria-hidden="true" />
            <span>Call to Get Started</span>
          </a>
        </div>
      </div>
    </section>
  );
}
