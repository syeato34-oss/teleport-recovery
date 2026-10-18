import { Phone } from 'lucide-react';
import { CallLink, PhoneNumber } from '@/components/CallLink';
import { WhatsAppLocationButton } from '@/components/WhatsAppLocationButton';

/** One call-first pair: equal buttons, with the location disclosure below both. */
export function RecoveryContactActions({ location, city, hero = false }: { location: string; city?: string; hero?: boolean }) {
  return (
    <div className={`recovery-contact-actions${hero ? ' recovery-contact-actions--hero' : ''}`}>
      <CallLink location={location} className={`btn-primary recovery-action recovery-action--call${hero ? ' hero-call-cta recovery-hero__call' : ''}${hero && city ? ' location-hero__call' : ''}`}>
        <Phone className="recovery-action__icon" aria-hidden="true" />
        <span>CALL <PhoneNumber /></span>
      </CallLink>
      <WhatsAppLocationButton location={`${location}_location`} city={city} compact
        className={`recovery-action${hero ? ' recovery-hero__whatsapp' : ''}${hero && city ? ' location-hero__whatsapp' : ''}`} />
    </div>
  );
}
