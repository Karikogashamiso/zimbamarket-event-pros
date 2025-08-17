import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedListings from "@/components/FeaturedListings";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CategorySection />
      <FeaturedListings />
      <LocationSection />
      <Footer />
    </div>
  );
};

export default Index;
