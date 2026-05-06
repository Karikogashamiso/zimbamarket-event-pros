import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: "hsl(248 38% 5%)", borderTop: "1px solid hsl(265 30% 16%)" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", to: "/" },
                { label: "About Us", to: "/about" },
                { label: "Events", to: "/events" },
                { label: "Search", to: "/search" },
                { label: "Terms & Services", to: "/terms-of-service" },
                { label: "Contact", to: "/contact" },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm transition-colors"
                    style={{ color: "hsl(270 10% 55%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(40 85% 68%)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(270 10% 55%)"; }}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">For Business</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Business Events", to: "/events" },
                { label: "Events Services", to: "/categories" },
                { label: "Event Planners", to: "/search?category=planners" },
                { label: "Event Business", to: "/list-business" },
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms or Consultants", to: "/terms-of-service" },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm transition-colors"
                    style={{ color: "hsl(270 10% 55%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(40 85% 68%)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(270 10% 55%)"; }}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "Communications", to: "/contact" },
                { label: "Contact Us", to: "/contact" },
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm transition-colors"
                    style={{ color: "hsl(270 10% 55%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(40 85% 68%)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(270 10% 55%)"; }}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "https://facebook.com" },
                { Icon: Twitter, href: "https://twitter.com" },
                { Icon: Youtube, href: "https://youtube.com" },
                { Icon: Instagram, href: "https://instagram.com" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: "hsl(248 30% 12%)",
                    border: "1px solid hsl(265 30% 22%)",
                    color: "hsl(270 10% 60%)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "hsl(265 80% 62% / 0.2)";
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(265 80% 62% / 0.5)";
                    (e.currentTarget as HTMLElement).style.color = "white";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "hsl(248 30% 12%)";
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(265 30% 22%)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(270 10% 60%)";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid hsl(265 30% 14%)" }}
        >
          <span
            className="text-xl font-bold"
            style={{
              background: "linear-gradient(135deg, hsl(40 85% 68%), hsl(38 70% 48%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ZimEventPro
          </span>
          <p className="text-xs" style={{ color: "hsl(270 10% 40%)" }}>
            © {new Date().getFullYear()} ZimEventPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
