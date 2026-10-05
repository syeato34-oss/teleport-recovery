import type { ComponentProps } from 'react';
import { businessConfig } from '@/config/business';
import { trackEvent } from '@/lib/tracking';

type CallLinkProps = Omit<ComponentProps<'a'>, 'href'> & { location: string };

/** All call controls share the canonical destination and a non-blocking event. */
export function CallLink({ location, onClick, children, ...props }: CallLinkProps) {
  return (
    <a
      {...props}
      href={businessConfig.phoneHref}
      aria-label={props['aria-label'] ?? `Call ${businessConfig.tradingName} on ${businessConfig.phoneDisplay}`}
      onClick={(event) => {
        trackEvent('call_click', { location });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
