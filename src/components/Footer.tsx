import { Link } from "react-router-dom";
import {
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Mail, 
  Home,
  BookOpen,
  Search,
  Building2,
  HelpCircle,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white border-t border-border/10">
      <div className="container mx-auto px-4 py-6">
        {/* Icon-only Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Home">
            <Home className="w-5 h-5" />
          </Link>
          <Link to="/categories" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Services">
            <Search className="w-5 h-5" />
          </Link>
          <Link to="/blog" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Blog">
            <BookOpen className="w-5 h-5" />
          </Link>
          <Link to="/list-business" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="List Business">
            <Building2 className="w-5 h-5" />
          </Link>
          <Link to="/help" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Help">
            <HelpCircle className="w-5 h-5" />
          </Link>
          <Link to="/contact" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Contact">
            <Mail className="w-5 h-5" />
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Facebook">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Instagram">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Twitter">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="LinkedIn">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs opacity-60">
          <span>© 2024 ZimEventPro</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy</Link>
            <Link to="/terms-of-service" className="hover:opacity-100 transition-opacity">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;