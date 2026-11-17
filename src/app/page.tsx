import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { LandingHero, HowItWorks } from "@/components/marketing/landing-hero";
import { FeaturedSitters } from "@/components/marketing/featured-sitters";
import { TrustSection, Testimonials } from "@/components/marketing/trust-section";
import { FaqSection, SitterCta } from "@/components/marketing/faq-section";

export const metadata: Metadata = {
  title: "Trusted childcare, on demand",
  description:
    "Find verified, background-checked babysitters near you. Compare profiles, book securely, and relax. BabySitter Connect makes finding trusted care calm and simple.",
};

export default function HomePage() {
  return (
    <PublicShell>
      <LandingHero />
      <HowItWorks />
      <FeaturedSitters />
      <TrustSection />
      <Testimonials />
      <FaqSection />
      <SitterCta />
    </PublicShell>
  );
}
