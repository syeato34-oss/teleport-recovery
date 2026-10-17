import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Coverage } from '@/components/Coverage';
import { ReassuranceStrip } from '@/components/ReassuranceStrip';
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

const legalPaths: LegalPath[] = ['/terms', '/guarantee', '/privacy'];

function App() {
  const pathname = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
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
            <ReassuranceStrip />
            <Services />
            <HowItWorks />
            <Trust />
            <CallbackSection />
            <FAQs />
            <ContactSection />
          </>
        ) : legalPath ? (
          <LegalPage pathname={legalPath} />
        ) : locationPage ? (
          <LocationPage page={locationPage} />
        ) : (
          <NotFoundPage />
        )}
      </main>
      <Footer />
      <MobileCallBar whatsappMessage={locationPage?.whatsappMessage} />
      <AdvertisingConsent />
      {/* Spacer so the fixed mobile call bar doesn't cover footer content */}
      <div className="h-[var(--mobile-call-bar-height)] lg:hidden" aria-hidden="true" />
    </div>
  );
}

export default App;
