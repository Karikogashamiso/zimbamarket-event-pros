import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Zim<span className="text-secondary">EventPro</span>
            </h3>
            <p className="text-white/80 mb-6">
              Zimbabwe's premier event marketplace connecting you with the best event services nationwide.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Browse Services</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">List Your Business</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">How It Works</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Success Stories</a></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Wedding Venues</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Catering Services</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">DJs & Entertainment</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Photography</a></li>
              <li><a href="#" className="text-white/80 hover:text-secondary transition-colors">Event Planning</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <span className="text-white/80">hello@zimeventpro.co.zw</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <span className="text-white/80">+263 4 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="text-white/80">Harare, Zimbabwe</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="font-medium mb-2">Stay Updated</h5>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button variant="secondary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © 2024 ZimEventPro. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/60 hover:text-secondary text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/60 hover:text-secondary text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-white/60 hover:text-secondary text-sm transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;