import { CallLink } from '@/components/CallLink';
import { Phone, MapPin } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { HeroAmbientVisual } from '@/components/HeroAmbientVisual';
import { WhatsAppLocationButton } from '@/components/WhatsAppLocationButton';

const HERO_IMAGE =
  'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb&w=1920';
const HERO_IMAGE_MOBILE =
  'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb&w=900';

const TRUST_MESSAGES = [
  { text: 'UK-WIDE COVERAGE.', className: 'text-white' },
  { text: 'CLEAR PRICE BEFORE DISPATCH.', className: 'text-text-muted' },
  { text: `${businessConfig.averageEtaMinutes} MIN AVERAGE ETA*`, className: 'text-accent-light' },
];

export function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          srcSet={`${HERO_IMAGE_MOBILE} 900w, ${HERO_IMAGE} 1920w`}
          sizes="100vw"
          alt="Recovery truck loading a vehicle on the roadside"
          className="hero-background-motion h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-image-shade absolute inset-0" aria-hidden="true" />
      </div>

      <HeroAmbientVisual />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-20 pb-28 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        <div className="max-w-2xl animate-fade-up">
          {/* UK-wide label */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-divider/80 bg-panel/60 px-4 py-2 backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
              Vehicle Recovery Across the UK
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-white">
            <span className="block text-[clamp(3.5rem,12vw,5rem)] font-extrabold leading-[0.9] tracking-[-0.045em] lg:text-[5.5rem]">
              FAST.
            </span>
            <span className="mt-2 block whitespace-nowrap text-[clamp(2.35rem,10vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-accent">
              24/7 RECOVERY.
            </span>
            <span className="mt-3 block text-xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-2xl lg:mt-4 lg:text-[2rem]">
              <a href={businessConfig.guaranteeUrl} className="underline-offset-4 hover:underline">
                MONEY-BACK GUARANTEE*
              </a>
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-[13px] leading-5 text-text-muted sm:text-sm">
            {businessConfig.guaranteeSummary}{' '}
            <a href={businessConfig.guaranteeUrl} className="text-accent-light underline underline-offset-4">
              Terms apply.
            </a>
          </p>

          {/* CTAs */}
          <div className="hero-actions mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <CallLink location="hero"
              className="btn-primary hero-call-cta h-[58px] min-h-[58px] gap-3 whitespace-nowrap px-8 py-0 text-lg font-bold sm:h-[60px] sm:min-h-[60px] sm:px-10"
              aria-label={`Call ${businessConfig.tradingName} at ${businessConfig.phoneDisplay}`}
            >
              <Phone className="hero-call-icon h-[22px] w-[22px]" aria-hidden="true" />
              <span>Call {businessConfig.phoneDisplay}</span>
            </CallLink>
            <WhatsAppLocationButton
              location="hero"
              className="hero-whatsapp-cta h-[58px] min-h-[58px] whitespace-nowrap px-5 py-0 text-base font-semibold sm:h-[60px] sm:min-h-[60px] sm:px-6"
            />
          </div>

          {/* Supporting copy */}
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-text-main/90 sm:text-xl">
            Need recovery anywhere in the UK? Send us your pickup location and destination — we’ll confirm
            the price and ETA before dispatch.
          </p>

          {/* Trust signals */}
          <div className="hero-status mt-5 max-w-2xl" aria-label="Recovery service information">
            <ul className="hero-status__list">
              {TRUST_MESSAGES.map((message) => (
                <li className={`hero-status__item ${message.className}`} key={message.text}>
                  {message.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 max-w-xl text-[13px] leading-5 text-text-muted">
            *{businessConfig.averageEtaQualifier}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:block animate-fade-in">
        <div className="hero-scroll-cue flex flex-col items-center gap-2 text-text-muted/50">
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="h-8 w-px bg-divider" />
        </div>
      </div>
    </section>
  );
}
