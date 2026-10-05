/** Verified public details. Unknown contact and legal details must not be invented. */
const tradingName = 'Teleport Recovery';
const phoneDisplay = '01234 900 700';
const phoneTel = '+441234900700';

export const businessConfig = {
  tradingName,
  tagline: 'UK Vehicle Recovery',
  phoneDisplay,
  phoneTel,
  phoneHref: `tel:${phoneTel}`,
  // Set only an owner-confirmed WhatsApp destination; null keeps the CTA hidden.
  whatsappHref: null as string | null,
  websiteUrl: 'https://teleportrecovery.co.uk',
  averageEtaMinutes: 45,
  averageEtaQualifier:
    'Average ETA is based on historical recovery experience. Actual arrival times can vary by location, traffic and operator availability.',
  guaranteeSummary: "If we're unable to provide the agreed recovery service.",
  termsUrl: '/terms',
  guaranteeUrl: '/guarantee',
  privacyUrl: '/privacy',
  // No confirmed email, WhatsApp destination or legal identity is available.
  // Required owner inputs are documented in docs/LEGAL_OWNER_INPUT.md.
  metaTitle: `${tradingName} | UK Vehicle Recovery`,
  metaDescription:
    'Stranded? We help arrange vehicle recovery across the UK. Call for breakdown recovery, roadside assistance, accident recovery and vehicle transportation. Tell us your location and we will help.',
} as const;

export type BusinessConfig = typeof businessConfig;
