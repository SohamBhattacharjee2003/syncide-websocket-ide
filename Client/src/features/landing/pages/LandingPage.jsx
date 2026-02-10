import Navbar from "../../../shared/components/layouts/Navbar";
import Footer from "../../../shared/components/layouts/Footer";

import HeroSection from "../components/HeroSection";
import LiveSignal from "../components/LiveSignal";
import FeaturesSection from "../components/FeaturesSection";
import WorkflowSection from "../components/WorkflowSection";
import EcosystemSection from "../components/EcosystemSection";
import SecuritySection from "../components/SecuritySection";

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
