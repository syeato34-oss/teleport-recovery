import { Phone, CheckCircle2 } from 'lucide-react';
import { businessConfig } from '@/config/business';

const reassuranceItems = [
  'Hear the option and quote before deciding',
  'Recovery arranged across the UK',
  'You decide whether to proceed',
];

export function ReassuranceStrip() {
  return (
    <section className="border-y border-divider bg-midnight-2 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          {/* Reassurance items */}
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            {reassuranceItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          {/* Compact CTA */}
          <a href={businessConfig.phoneHref} className="btn-primary whitespace-nowrap">
            <Phone className="h-5 w-5" aria-hidden="true" />
            <span>Call Now</span>
          </a>
        </div>
      </div>
    </section>
  );
}
