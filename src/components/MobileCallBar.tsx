import { CallLink } from '@/components/CallLink';
import { Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { useEffect, useRef } from 'react';
import { WhatsAppLocationButton } from '@/components/WhatsAppLocationButton';

/**
 * Fixed call-first conversion bar visible on mobile only.
 * Its measured height reserves scrolling space for keyboard focus and the footer.
 */
export function MobileCallBar({ city }: { city?: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!bar || !header) return;
    const root = document.documentElement;
    const measure = () => {
      root.style.setProperty('--mobile-call-bar-height', `${bar.getBoundingClientRect().height}px`);
      root.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    observer.observe(header);
    measure();
    return () => {
      observer.disconnect();
      root.style.removeProperty('--mobile-call-bar-height');
      root.style.removeProperty('--site-header-height');
    };
  }, []);

  return (
    <div ref={barRef} className="mobile-conversion-bar fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mobile-conversion-bar__actions bg-midnight/95 border-t border-divider backdrop-blur-md px-[16px] py-[12px] pb-[calc(12px+env(safe-area-inset-bottom))]">
        <CallLink location="mobilecallbar"
          className="btn-primary recovery-action recovery-action--call min-w-0"
          aria-label={`Call Now — ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
        >
          <Phone className="recovery-action__icon" aria-hidden="true" />
          <span className="min-w-0">CALL NOW</span>
        </CallLink>
        <WhatsAppLocationButton
          location="sticky_mobile"
          city={city}
          variant="sticky"
          className="recovery-action min-w-0"
        />
      </div>
    </div>
  );
}
