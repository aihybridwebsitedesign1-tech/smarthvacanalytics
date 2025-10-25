import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <HeroSection />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
