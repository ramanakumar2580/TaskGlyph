// src/app/page.tsx
"use client";

// Import Navbar (assuming it's in src/components/)
import Navbar from "@/components/Navbar";

// Import landing page section components
import HeroSection from "@/components/landing/HeroSection";
import WhyTaskGlyph from "@/components/landing/WhyTaskGlyph";
import WhoIsItForSection from "@/components/landing/WhoIsItForSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import OfflineAdvantageSection from "@/components/landing/OfflineAdvantageSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 antialiased">
      <Navbar />

      <main>
        <HeroSection />
        <WhyTaskGlyph />
        <WhoIsItForSection />
        <FeaturesSection />
        <OfflineAdvantageSection />
        <HowItWorksSection />
        <TestimonialSection />
        <PricingSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
