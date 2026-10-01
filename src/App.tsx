import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Coverage } from '@/components/Coverage';
import { ReassuranceStrip } from '@/components/ReassuranceStrip';
import { Services } from '@/components/Services';
import { HowItWorks } from '@/components/HowItWorks';
import { Trust } from '@/components/Trust';
import { FAQs } from '@/components/FAQs';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { MobileCallBar } from '@/components/MobileCallBar';

function App() {
  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <main>
        <Hero />
        <Coverage />
        <ReassuranceStrip />
        <Services />
        <HowItWorks />
        <Trust />
        <FAQs />
        <ContactSection />
      </main>
      <Footer />
      <MobileCallBar />
      {/* Spacer so the fixed mobile call bar doesn't cover footer content */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}

export default App;
