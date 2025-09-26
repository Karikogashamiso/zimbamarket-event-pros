import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  QrCode,
  MessageCircle,
  Home,
  BookOpen,
  Search,
  Building2,
  Users,
  Heart,
  HelpCircle,
  Star
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse Services", href: "/categories", icon: Search },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Video Tutorials", href: "/video-tutorials", icon: Users },
    { name: "List Business", href: "/list-business", icon: Building2 },
    { name: "About Us", href: "/about", icon: Users },
    { name: "Help Center", href: "/help", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: Mail }
  ];

  const serviceCategories = [
    { name: "Wedding Venues", href: "/categories?category=venues" },
    { name: "Catering Services", href: "/categories?category=food" },
    { name: "Event DJs", href: "/categories?category=entertainment" },
    { name: "Photography", href: "/categories?category=media" },
    { name: "Event Planning", href: "/categories?category=planning" },
    { name: "Decor & Flowers", href: "/categories?category=decor" },
    { name: "Entertainment", href: "/categories?category=entertainment" },
    { name: "Audio Visual", href: "/categories?category=technical" }
  ];

  const locations = [
    { name: "Harare Events", href: "/search?location=harare" },
    { name: "Bulawayo Events", href: "/search?location=bulawayo" },
    { name: "Mutare Events", href: "/search?location=mutare" },
    { name: "Victoria Falls Events", href: "/search?location=victoria-falls" },
    { name: "Gweru Events", href: "/search?location=gweru" },
    { name: "Masvingo Events", href: "/search?location=masvingo" },
    { name: "Chinhoyi Events", href: "/search?location=chinhoyi" },
    { name: "Kwekwe Events", href: "/search?location=kwekwe" }
  ];

  return (
    <footer className="bg-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-3xl font-bold text-primary">Z</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    Zim<span className="text-secondary">EventPro</span>
                  </h3>
                  <p className="text-sm text-white/70">Zimbabwe's Event Platform</p>
                </div>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                ZimEventPro connects you with top venues, entertainers, and event services—making event planning effortless across Zimbabwe.
              </p>
              
              {/* Social Media with QR Codes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg mb-3">Connect With Us</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Facebook Page */}
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Facebook className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">Page</span>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto">
                        <QrCode className="w-12 h-12 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Facebook Group */}
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Facebook className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">Group</span>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto">
                        <QrCode className="w-12 h-12 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Social Links */}
                <div className="flex space-x-3 pt-4">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-secondary">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-secondary">
                    <Twitter className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-secondary">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="flex items-center gap-3 text-white/80 hover:text-secondary transition-colors duration-200 group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Popular Services</h4>
            <ul className="space-y-3">
              {serviceCategories.map((service, index) => (
                <li key={index}>
                  <Link to={service.href} className="text-white/80 hover:text-secondary transition-colors duration-200 text-sm">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Locations & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Event Locations</h4>
            <ul className="space-y-3 mb-8">
              {locations.slice(0, 6).map((location, index) => (
                <li key={index}>
                  <Link to={location.href} className="text-white/80 hover:text-secondary transition-colors duration-200 text-sm">
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-white/80 text-sm">info@zimeventpro.co.zw</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-white/80 text-sm">+263 4 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-white/80 text-sm">Chisipite, Harare</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="border-t border-white/20 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-4">Stay Updated</h4>
            <p className="text-white/80 mb-6">
              Get the latest event planning tips, vendor updates, and special offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Button variant="secondary" className="px-6 py-3 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-white/60 text-sm">
              © 2024 ZimEventPro. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-secondary text-secondary">
                Made in Zimbabwe
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white/70">
                🇿🇼 Proudly Zimbabwean
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-white/60 hover:text-secondary text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-white/60 hover:text-secondary text-sm transition-colors">Terms of Service</Link>
            <Link to="/help" className="text-white/60 hover:text-secondary text-sm transition-colors">Support</Link>
          </div>
        </div>
      </div>
      
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/help">
          <Button 
            size="lg" 
            className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover-scale flex items-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Need Help?
          </Button>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;