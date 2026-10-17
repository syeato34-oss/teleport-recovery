import type { ComponentProps } from 'react';
import { MessageCircle } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { buildWhatsAppMessageUrl, buildWhatsAppRecoveryUrl, getWhatsAppDestination } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/tracking';

type WhatsAppLinkProps = Omit<ComponentProps<'a'>, 'href'> & { location: string; message?: string };

/** General customer messaging never requests device location. */
export function WhatsAppLink({ location, message, onClick, children = 'WhatsApp Us', ...props }: WhatsAppLinkProps) {
  const destination = getWhatsAppDestination(businessConfig.whatsappHref);
  if (!destination) return null;
  return (
    <a
      {...props}
      href={message === undefined ? buildWhatsAppRecoveryUrl(destination) : buildWhatsAppMessageUrl(destination, message)}
      onClick={(event) => {
        trackEvent('whatsapp_click', { location });
        onClick?.(event);
      }}
    >
      <MessageCircle className="h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </a>
  );
}
