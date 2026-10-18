import { Check, Clock3 } from 'lucide-react';
import type { RecoveryHeroContent } from '@/config/heroes';
import { RecoveryContactActions } from '@/components/RecoveryContactActions';

const image = 'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb';
type RecoveryHeroProps = {
  content: RecoveryHeroContent;
  city?: string;
  location: string;
  eta?: { minutes: number; qualification: string };
};

export function RecoveryHero({ content, city, location, eta }: RecoveryHeroProps) {
  const lead = content.heading.slice(0, -content.headingHighlight.length).trim();
  return (
    <section id={city ? undefined : 'top'} className={`recovery-hero relative overflow-hidden bg-midnight${city ? ' location-hero recovery-hero--city' : ' nationwide-hero'}`} aria-labelledby="recovery-hero-heading">
      <div className="absolute inset-0" aria-hidden="true">
        <img src={`${image}&w=1920`} srcSet={`${image}&w=900 900w, ${image}&w=1920 1920w`} sizes="100vw" alt=""
          className="recovery-hero__image h-full w-full object-cover" fetchPriority="high" decoding="async" />
        <div className="recovery-hero__shade absolute inset-0" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="recovery-hero__content">
          <p className="recovery-hero__eyebrow"><span aria-hidden="true" />{content.eyebrow}</p>
          <h1 id="recovery-hero-heading" className={`recovery-hero__heading${city ? ' location-hero__heading' : ''}`}>
            <span>{lead}</span>{' '}<span className="recovery-hero__highlight">{content.headingHighlight}</span>
          </h1>
          <p className="recovery-hero__summary">{content.summary}</p>
          <RecoveryContactActions location={location} city={city} hero />
          <ul className="recovery-hero__trust location-hero__trust" aria-label="Booking reassurance">
            {content.trust.map((feature, index) => (
              <li key={feature}>
                <span className={`location-hero__check location-hero__check--${index + 1}`} aria-hidden="true"><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {eta && <div className="location-hero__eta">
            <Clock3 className="h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
            <span aria-describedby="location-hero-eta-note">{eta.minutes} MIN ETA*</span>
            <small id="location-hero-eta-note">*{eta.qualification}</small>
          </div>}
        </div>
      </div>
    </section>
  );
}
