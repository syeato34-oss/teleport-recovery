import type { ComponentProps } from 'react';
import { businessConfig } from '@/config/business';
import { trackEvent } from '@/lib/tracking';
import { usePhoneNumber } from '@/hooks/usePhoneNumber';

type CallLinkProps = Omit<ComponentProps<'a'>, 'href'> & { location: string };

/** React owns display and destination together, including later-mounted call controls. */
export function CallLink({ location, onClick, children, ...props }: CallLinkProps) {
  const phone = usePhoneNumber();
  return (
    <a
      {...props}
      href={phone.href}
      aria-label={props['aria-label']?.split(businessConfig.phoneDisplay).join(phone.display)}
      onClick={(event) => {
        trackEvent('call_click', { location });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

export function PhoneNumber() { return <>{usePhoneNumber().display}</>; }
