import { homepageHero } from '@/config/heroes';
import { RecoveryHero } from '@/components/RecoveryHero';

export function Hero() {
  return <RecoveryHero content={homepageHero} location="hero" />;
}
