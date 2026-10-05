import { CallLink } from '@/components/CallLink';
import { MapPinned, Navigation } from 'lucide-react';

const COVERAGE_IMAGE =
  'https://images.pexels.com/photos/24343234/pexels-photo-24343234.jpeg?auto=compress&cs=tinysrgb';

export function Coverage() {
  return (
    <section id="coverage" className="bg-midnight py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl border border-divider order-2 lg:order-1">
            <img
              src={`${COVERAGE_IMAGE}&w=1600`}
              srcSet={`${COVERAGE_IMAGE}&w=800 800w, ${COVERAGE_IMAGE}&w=1200 1200w, ${COVERAGE_IMAGE}&w=1600 1600w`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt="UK highway at night with traffic"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-midnight/20" aria-hidden="true" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-xl" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="section-label">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Nationwide Coverage
            </span>
            <h2 className="heading-lg mt-3 text-white">Vehicle Recovery Anywhere in the UK</h2>
            <p className="mt-4 body-lg">
              We arrange local and longer-distance vehicle recovery across the UK. Tell us where
              you are and where the vehicle needs to go — we'll check what's available for your
              journey.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-divider bg-panel">
                  <Navigation className="h-4 w-4 text-accent" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Tell us your location</p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    Postcode, road name or a nearby landmark — whatever helps us find you.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-divider bg-panel">
                  <MapPinned className="h-4 w-4 text-accent" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Share your destination</p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    Where the vehicle needs to go — home, a garage or another address.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-sm text-text-muted/70 border-l-2 border-accent/40 pl-4">
              We'll explain the available option and quote before anything is arranged. You decide
              whether to proceed.
            </p>

            <div className="mt-8">
              <CallLink location="coverage" className="btn-primary">
                Call to Check Availability
              </CallLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
