export type RecoveryHeroContent = {
  eyebrow: string;
  heading: string;
  headingHighlight: string;
  summary: string;
  trust: readonly string[];
};

export const homepageHero: RecoveryHeroContent = {
  eyebrow: '24/7 NATIONWIDE RECOVERY',
  heading: 'BROKEN DOWN? GET RECOVERY NOW.',
  headingHighlight: 'GET RECOVERY NOW.',
  summary: 'Stranded? Call now for availability, a clear quote and an estimated arrival time. Or send your exact pickup location via WhatsApp.',
  trust: ['No membership needed', 'Price before booking'],
};

export function cityHero(city: string): RecoveryHeroContent {
  return {
    eyebrow: `24/7 ${city.toUpperCase()} RECOVERY`,
    heading: `BROKEN DOWN IN ${city.toUpperCase()}? GET RECOVERY NOW.`,
    headingHighlight: 'GET RECOVERY NOW.',
    summary: `Need vehicle recovery in ${city}? Call now for availability, a clear quote and an estimated arrival time.`,
    trust: ['No membership needed', 'Price before booking'],
  };
}
