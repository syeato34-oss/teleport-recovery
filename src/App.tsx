import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Coverage } from '@/components/Coverage';
import { Services } from '@/components/Services';
import { HowItWorks } from '@/components/HowItWorks';
import { Trust } from '@/components/Trust';
import { FAQs } from '@/components/FAQs';
import { CallbackSection, ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { MobileCallBar } from '@/components/MobileCallBar';
import { LegalPage, type LegalPath } from '@/pages/LegalPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { getLocationPage } from '@/config/locations';
import { LocationPage } from '@/pages/LocationPage';
import { AdvertisingConsent } from '@/components/AdvertisingConsent';
import { DirectoryPage } from '@/pages/DirectoryPage';
import { ServicePage } from '@/pages/ServicePage';
import { NationwideCoverage } from '@/components/RecoveryNavigation';
import { getSiteRoute } from '@/config/routes';
import { getArea } from '@/config/areas';
import { AdvicePage } from '@/pages/AdvicePage';

const legalPaths: LegalPath[] = ['/terms', '/guarantee', '/privacy'];

function App({ path = typeof window === 'undefined' ? '/' : window.location.pathname }: { path?: string }) {
  const route = getSiteRoute(path);
  const pathname = route?.path ?? (path.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/');
  const legalPath = legalPaths.find((path) => path === pathname);
  const locationPage = getLocationPage(pathname);
  return (
    <div className="min-h-screen bg-midnight">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {pathname === '/' ? (
          <>
            <Hero />
            <Coverage />
            <NationwideCoverage />
            <Services />
            <HowItWorks />
            <Trust />
            <CallbackSection />
            <FAQs />
            <ContactSection />
          </>
        ) : route?.kind === 'areas' || route?.kind === 'region' ? (
          <DirectoryPage regionId={route.kind === 'region' ? route.key : undefined} />
        ) : route?.kind === 'advice' || route?.kind === 'guide' ? (
          <AdvicePage guideId={route.kind === 'guide' ? route.key : undefined} />
        ) : ['services', 'service', 'city-service'].includes(route?.kind ?? '') ? (
          <ServicePage serviceId={route?.kind === 'service' ? route.key : undefined} cityServiceKey={route?.kind === 'city-service' ? route.key : undefined} />
        ) : legalPath ? (
          <LegalPage pathname={legalPath} />
        ) : locationPage ? (
          <LocationPage page={locationPage} />
        ) : (
          <NotFoundPage />
        )}
      </main>
      <Footer />
      <MobileCallBar city={locationPage?.city ?? (route?.kind === 'city-service' ? getArea(route.key!.split('/')[0])?.name : undefined)} />
      <AdvertisingConsent />
      {/* Spacer so the fixed mobile call bar doesn't cover footer content */}
      <div className="h-[var(--mobile-call-bar-height)] lg:hidden" aria-hidden="true" />
    </div>
  );
}

export default App;
