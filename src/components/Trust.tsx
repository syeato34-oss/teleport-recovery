import { MapPin, Car, Wrench, Flag, ShieldCheck } from 'lucide-react';

const preparationItems = [
  {
    icon: MapPin,
    label: 'Your location',
    detail: 'Postcode, road name or nearby landmark.',
  },
  {
    icon: Car,
    label: 'Vehicle type',
    detail: 'Make, model and any notable details.',
  },
  {
    icon: Wrench,
    label: 'The issue',
    detail: 'What happened — breakdown, accident or other.',
  },
  {
    icon: Flag,
    label: 'Destination',
    detail: 'Where the vehicle needs to be taken.',
  },
];

export function Trust() {
  return (
    <section id="trust" className="bg-midnight-2 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Preparation checklist */}
          <div>
            <span className="section-label">Before You Call</span>
            <h2 className="heading-lg mt-3 text-white">Information to Prepare</h2>
            <p className="mt-4 body-base">
              Having these details ready helps us respond faster and more accurately.
            </p>

            <ul className="mt-8 divide-y divide-divider overflow-hidden rounded-xl border border-divider bg-panel/30">
              {preparationItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-4 px-5 py-4 sm:px-6"
                >
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-0.5 text-sm text-text-muted">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Reassurance */}
          <div className="flex flex-col justify-center">
            <span className="section-label">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              No Surprises
            </span>
            <h2 className="heading-lg mt-3 text-white">You Stay in Control</h2>
            <div className="mt-8 space-y-5">
              <div className="rounded-lg border border-divider bg-panel/30 p-5">
                <p className="text-sm font-semibold text-white">Hear the quote first</p>
                <p className="mt-1.5 text-sm text-text-muted">
                  We explain the recovery option and the price. Nothing is arranged until you say so.
                </p>
              </div>
              <div className="rounded-lg border border-divider bg-panel/30 p-5">
                <p className="text-sm font-semibold text-white">Clear next steps</p>
                <p className="mt-1.5 text-sm text-text-muted">
                  We tell you what to expect and what we need from you at each stage.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
