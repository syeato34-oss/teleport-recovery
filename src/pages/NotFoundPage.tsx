import { Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { CallLink } from '@/components/CallLink';

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-start justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <span className="section-label">Page not found</span>
      <h1 className="heading-lg mt-3 text-white">Let’s get you back on the road.</h1>
      <p className="body-lg mt-4 max-w-xl">This page could not be found. You can return to our recovery services or call us for help.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="/" className="btn-secondary">Back to recovery services</a>
        <CallLink location="not_found" className="btn-primary">
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call {businessConfig.phoneDisplay}
        </CallLink>
      </div>
    </section>
  );
}
