import { Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';

/**
 * Fixed bottom call bar visible on mobile only.
 * Stays above content via padding-bottom on the page wrapper.
 */
export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="bg-midnight/95 border-t border-divider backdrop-blur-md px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <a
          href={businessConfig.phoneHref}
          className="btn-primary w-full text-base"
          aria-label={`Call ${businessConfig.phoneNumber}`}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          <span>Call {businessConfig.phoneNumber}</span>
        </a>
      </div>
    </div>
  );
}
