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
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-accent transition-colors">Services</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-accent transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Business</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/list-business" className="hover:text-accent transition-colors">List Your Business</Link>
              </li>
              <li>
                <Link to="/business-dashboard" className="hover:text-accent transition-colors">Business Dashboard</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-accent transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-3 mb-3">
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="opacity-80">© 2024 ZimEventPro. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-accent transition-colors opacity-80 hover:opacity-100">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-accent transition-colors opacity-80 hover:opacity-100">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;