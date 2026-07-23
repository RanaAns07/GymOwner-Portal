import HeroSection from '@/components/landing/HeroSection';
// import FeaturesGrid from '@/components/landing/FeaturesGrid';
// import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <HeroSection />
      {/* Precision Engineered Features — restore later */}
      {/* <FeaturesGrid /> */}
      {/* Scalable Pricing — restore later */}
      {/* <PricingSection /> */}
      <Footer />
    </main>
  );
}

