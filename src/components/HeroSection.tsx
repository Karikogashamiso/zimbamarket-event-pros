import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "hsl(248 35% 6%)" }}>

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(265 80% 62% / 0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(265 80% 50% / 0.1) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* Hero Card with purple neon border */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 pt-28 pb-8 animate-fade-in-up">
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            border: "1px solid hsl(265 80% 62% / 0.5)",
            boxShadow: "0 0 40px hsl(265 80% 62% / 0.15), 0 0 80px hsl(265 80% 62% / 0.08)",
          }}
        >
          {/* Hero image */}
          <div
            className="h-72 sm:h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${heroBackground})` }}
          >
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, hsl(265 80% 20% / 0.7), hsl(248 50% 10% / 0.6))" }} />

            {/* Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
              >
                Find & Book{" "}
                <span style={{
                  background: "linear-gradient(135deg, hsl(40 85% 70%), hsl(38 70% 52%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Exclusive
                </span>
                <br />Event Services
              </h1>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-[#0d0b1e] px-6 py-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 flex items-center gap-3 rounded-full px-4 py-3"
                style={{
                  background: "hsl(248 25% 14%)",
                  border: "1px solid hsl(265 30% 22%)",
                }}>
                <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venues, caterers, DJs..."
                  className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-gold px-6 py-3 rounded-full text-sm font-bold flex-shrink-0"
              >
                Search
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => navigate("/categories")}
                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  border: "1px solid hsl(40 75% 55% / 0.5)",
                  color: "hsl(40 85% 68%)",
                  background: "transparent",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(40 75% 55% / 0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                All Services
              </button>
              <button
                onClick={() => navigate("/list-business")}
                className="btn-gold px-6 py-2.5 rounded-full text-sm font-bold"
              >
                List Your Business
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
