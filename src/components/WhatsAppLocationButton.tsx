import { useEffect, useId, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { trackEvent } from '@/lib/tracking';
import { buildWhatsAppRecoveryUrl, getPickupLocation, getWhatsAppDestination } from '@/lib/whatsapp';

type WhatsAppLocationButtonProps = {
  location: string;
  className?: string;
};

export function WhatsAppLocationButton({ location, className = '' }: WhatsAppLocationButtonProps) {
  const destination = getWhatsAppDestination(businessConfig.whatsappHref);
  const disclosureId = useId();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [navigationFailed, setNavigationFailed] = useState(false);
  const pending = useRef(false);
  const requestId = useRef(0);

  useEffect(() => {
    const cancel = () => {
      requestId.current += 1;
      pending.current = false;
    };
    const restore = (event: PageTransitionEvent) => {
      // The initial pageshow can arrive after a fast click while images are still loading.
      if (!event.persisted) return;
      cancel();
      setBusy(false);
      setStatus('');
      setNavigationFailed(false);
    };
    window.addEventListener('pagehide', cancel);
    window.addEventListener('pageshow', restore);
    return () => {
      cancel();
      window.removeEventListener('pagehide', cancel);
      window.removeEventListener('pageshow', restore);
    };
  }, []);

  if (!destination) return null;

  const handleClick = async () => {
    if (pending.current) return;
    pending.current = true;
    const activeRequest = ++requestId.current;
    setBusy(true);
    setNavigationFailed(false);
    setStatus('Getting your location. If it is unavailable, you can share it in WhatsApp.');
    trackEvent('whatsapp_click', { location });

    const pickup = await getPickupLocation(navigator.geolocation);
    if (requestId.current !== activeRequest) return;
    setStatus(pickup
      ? 'Opening WhatsApp with your pickup location. Review the message before sending.'
      : 'Location unavailable. Opening WhatsApp with a blank pickup field for you to complete.');
    try {
      // Same-tab navigation works after the asynchronous location request without a popup.
      window.location.assign(buildWhatsAppRecoveryUrl(destination, pickup));
    } catch {
      setNavigationFailed(true);
      setStatus('WhatsApp could not open. Please use the Call button for help.');
    } finally {
      // A native app handoff may leave this document alive. Acquisition has finished.
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`btn-secondary whatsapp-location-button ${className}`}
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        aria-describedby={disclosureId}
      >
        <MessageCircle className="whatsapp-location-icon h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
        <span>{busy ? 'Getting your location…' : 'Share My Location on WhatsApp'}</span>
      </button>
      <p id={disclosureId} className="basis-full text-xs leading-relaxed text-text-muted">
        With permission, add a Maps pickup link to a WhatsApp draft. Opening the draft shares
        the link with WhatsApp. Review and send it yourself, or enter your location manually.{' '}
        <a href={businessConfig.privacyUrl} className="text-accent-light underline underline-offset-4">
          Location privacy
        </a>.
      </p>
      <span role="status" aria-atomic="true" className={navigationFailed ? 'basis-full text-sm leading-5 text-text-main' : 'sr-only'}>
        {status}
      </span>
    </>
  );
}
