import { Building2, Utensils, Music, Camera, Flower, UserCheck, Scissors, Mic, Shield, Guitar, Lightbulb, Speaker, Image, ChefHat, ShoppingBag, Heart, Video, Cake, Piano, Wine, Users2, Palette } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Link } from "react-router-dom";

// Category images - using Unsplash for visual richness
const CATEGORY_IMAGES: Record<string, string> = {
  "Venues": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
  "Catering": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop",
  "Photography": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
  "DJs & Entertainment": "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=300&fit=crop",
  "Decor": "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&h=300&fit=crop",
  "Planners": "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&h=300&fit=crop",
  "Florists": "https://images.unsplash.com/photo-1487530811015-780bab56ab31?w=400&h=300&fit=crop",
  "Security": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
  "Transport": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
  "Audio Visual": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
  "MCs": "https://images.unsplash.com/photo-1578025880049-21e48b0e527c?w=400&h=300&fit=crop",
  "Lighting": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop";

const iconMap: Record<string, unknown> = {
  Building2, Utensils, Wine, Music, Users2, Flower, Palette, Camera,
  Video, Cake, Piano, UserCheck, Scissors, Mic, Shield, Guitar,
  Lightbulb, Speaker, Image, ChefHat, ShoppingBag, Heart,
};

const CategorySection = () => {
  const { categories, loading } = useCategories();

  const skeletons = Array.from({ length: 6 });

  return (
    <section className="py-16 relative" style={{ background: "hsl(248 35% 6%)" }}>
      {/* Section background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, hsl(265 80% 62% / 0.08) 0%, transparent 70%)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
          {loading
            ? skeletons.map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden aspect-[4/3] animate-pulse"
                  style={{ background: "hsl(248 30% 11%)", border: "1px solid hsl(265 30% 18%)" }} />
              ))
            : (categories.slice(0, 6)).map((cat, i) => {
                const imgSrc = CATEGORY_IMAGES[cat.name] || FALLBACK_IMG;
                return (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.slug}`}
                    className="group relative rounded-2xl overflow-hidden hover-lift"
                    style={{
                      border: "1px solid hsl(265 80% 62% / 0.25)",
                      boxShadow: "0 0 0 0 hsl(265 80% 62% / 0)",
                      animation: `fade-in-up 0.6s ease-out ${i * 0.08}s both`,
                      transition: "border-color 0.3s, box-shadow 0.3s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(265 80% 62% / 0.7)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px hsl(265 80% 62% / 0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(265 80% 62% / 0.25)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b1e]/90 via-[#0d0b1e]/30 to-transparent" />

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-base mb-2" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
                        {cat.name}
                      </h3>
                      <span className="explore-chip">Explore</span>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* View all link */}
        {!loading && categories.length > 6 && (
          <div className="text-center mt-8">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:bg-purple-500/10"
              style={{
                border: "1px solid hsl(265 80% 62% / 0.4)",
                color: "hsl(265 80% 78%)",
              }}
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
