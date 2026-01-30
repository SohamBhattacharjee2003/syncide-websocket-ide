import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

import HeroSection from "../components/landing/HeroSection";
import LiveSignal from "../components/landing/LiveSignal";
import FeaturesSection from "../components/landing/FeaturesSection";
import WorkflowSection from "../components/landing/WorkflowSection";
import EcosystemSection from "../components/landing/EcosystemSection";
import SecuritySection from "../components/landing/SecuritySection";

export default function LandingPage() {
  return (
    <div className="bg-[#020617] text-neutral-200">
      <Navbar />

      <HeroSection />
      <LiveSignal />
      <FeaturesSection />
      <WorkflowSection />
      <EcosystemSection />
      <SecuritySection />

      <Footer />
    </div>
  );
}
