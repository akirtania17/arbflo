import { useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ScannerSection from "@/components/ScannerSection";

const Index = () => {
  const scannerRef = useRef<HTMLDivElement>(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection onGetStarted={scrollToScanner} />
      <div ref={scannerRef}>
        <ScannerSection />
      </div>
    </div>
  );
};

export default Index;
