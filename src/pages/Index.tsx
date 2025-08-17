import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedListings from "@/components/FeaturedListings";
import LocationSection from "@/components/LocationSection";
import TrustSection from "@/components/TrustSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CategorySection />
      <FeaturedListings />
      <LocationSection />
      <TrustSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Index;
