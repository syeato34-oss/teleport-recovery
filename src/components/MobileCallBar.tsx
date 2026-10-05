import { CallLink } from '@/components/CallLink';
import { Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { useEffect, useRef } from 'react';
import { WhatsAppLink } from '@/components/WhatsAppLink';

/**
 * Fixed call-first conversion bar visible on mobile only.
 * Its measured height reserves scrolling space for keyboard focus and the footer.
 */
export function MobileCallBar() {
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-[12px] bg-midnight/95 border-t border-divider backdrop-blur-md px-[16px] py-[12px] pb-[calc(12px+env(safe-area-inset-bottom))]">
        <CallLink location="mobilecallbar"
          className="btn-primary min-w-0 px-3 text-base"
          aria-label={`Call Now — ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
        >
          <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0">Call Now</span>
        </CallLink>
        <WhatsAppLink
          location="sticky_mobile"
          className="btn-secondary min-w-0 px-3 text-base"
          aria-label={`WhatsApp — Message ${businessConfig.tradingName}`}
        >WhatsApp</WhatsAppLink>
      </div>
    </div>
  );
}
