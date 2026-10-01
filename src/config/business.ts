/**
 * Business Configuration
 * ──────────────────────────────────────────────────────
 * All values below are PLACEHOLDERS.
 * Replace them with your real business details before
 * publishing. Do not go live with placeholder contact info.
 */

export const businessConfig = {
  name: 'Teleport Recovery',
  tagline: 'UK Vehicle Recovery',

  // Replace with your real phone number (UK format)
  phoneNumber: '0800 000 0000',
  phoneHref: 'tel:0800000000',

  // Replace with your real WhatsApp number and link
  whatsappNumber: '0800 000 0000',
  whatsappHref: 'https://wa.me/440000000000',

  // Replace with your real email
  email: 'help@example.co.uk',
  emailHref: 'mailto:help@example.co.uk',

  // Replace with your real address or remove if not applicable
  address: null as string | null,

  // Replace with real company registration if applicable
  companyNumber: null as string | null,

  // Privacy policy URL — set when available
  privacyUrl: null as string | null,

  // Real reviews — add only genuine testimonials
  reviews: [] as Array<{ name: string; location: string; text: string }>,

  // SEO
  metaTitle: 'Teleport Recovery | UK Vehicle Recovery',
  metaDescription:
    'Stranded? We help arrange vehicle recovery across the UK. Call for breakdown recovery, roadside assistance, accident recovery and vehicle transportation. Tell us your location and we will help.',
} as const;

export type BusinessConfig = typeof businessConfig;
