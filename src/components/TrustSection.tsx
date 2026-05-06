import { Shield, CreditCard, Heart } from "lucide-react";

const TrustSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Vetted Providers",
      desc: "All providers are thoroughly screened and verified for quality and reliability.",
    },
    {
      icon: CreditCard,
      title: "Instant Booking & Payments",
      desc: "Seamless booking process with instant confirmation and secure payments.",
    },
    {
      icon: Heart,
      title: "Trusted Community",
      desc: "Join a thriving community with thousands of satisfied customers.",
    },
  ];

  const stats = [
    { value: "10k+", label: "Happy Clients" },
    { value: "500+", label: "Vendors" },
    { value: "20k+", label: "Community" },
  ];

  return (
    <section className="py-20 relative" style={{ background: "hsl(248 35% 6%)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold gradient-gold mb-2">
            Premium Vendors & Growth
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 text-center transition-all duration-300 hover-lift"
              style={{
                background: "hsl(248 30% 10%)",
                border: "1px solid hsl(265 30% 18%)",
                boxShadow: "none",
                animation: `fade-in-up 0.6s ease-out ${i * 0.1}s both`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(265 80% 62% / 0.5)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px hsl(265 80% 62% / 0.12)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(265 30% 18%)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "hsl(265 80% 62% / 0.15)", border: "1px solid hsl(265 80% 62% / 0.3)" }}
              >
                <f.icon className="w-6 h-6" style={{ color: "hsl(265 80% 72%)" }} />
              </div>
              <h3 className="font-bold text-white mb-3 text-base">{f.title}</h3>
              <p className="text-sm" style={{ color: "hsl(270 10% 55%)" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center" style={{ animation: `fade-in-up 0.7s ease-out ${i * 0.12}s both` }}>
              <div
                className="text-4xl md:text-5xl font-black mb-2"
                style={{
                  background: "linear-gradient(135deg, hsl(40 85% 70%), hsl(38 70% 52%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <p className="text-sm font-semibold text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
