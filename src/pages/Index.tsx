
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import PartnerSharing from "@/components/PartnerSharing";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <PartnerSharing />
        <About />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
