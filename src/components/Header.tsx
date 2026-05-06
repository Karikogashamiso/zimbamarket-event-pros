import { Bell, Search, User, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield, Building2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

const Header = ({ variant = "transparent" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasBusinessListings, setHasBusinessListings] = useState(false);
  const [hasOrganizerProfile, setHasOrganizerProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkUserAccess = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setHasBusinessListings(false);
      setHasOrganizerProfile(false);
      return;
    }
    try {
      const [roleData, listingsData, organizerData] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
        supabase.from("business_listings").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
        supabase.from("organizers").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
      ]);
      setIsAdmin(!!roleData.data);
      setHasBusinessListings(!!listingsData.data);
      setHasOrganizerProfile(!!organizerData.data);
    } catch (err) {
      console.error("Header access check error:", err);
    }
  }, [user]);

  useEffect(() => {
    checkUserAccess();
  }, [checkUserAccess]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "See you next time!" });
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const scrolled = isScrolled || variant === "solid";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0b1e]/95 backdrop-blur-xl border-b border-purple-500/20 shadow-lg shadow-purple-900/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(135deg, hsl(40 85% 68%), hsl(38 70% 48%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ZimEventPro
            </span>
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/categories" className="text-white/80 hover:text-white text-sm font-medium transition-colors hover:text-[hsl(40_85%_68%)]">
              Browse
            </Link>
            <Link to="/events" className="text-white/80 hover:text-white text-sm font-medium transition-colors hover:text-[hsl(40_85%_68%)]">
              Events
            </Link>
            <Link to="/list-business" className="text-white/80 hover:text-white text-sm font-medium transition-colors hover:text-[hsl(40_85%_68%)]">
              List Business
            </Link>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Search icon */}
            <button
              onClick={() => navigate("/search")}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bell */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/70 transition-all">
                    <User className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-[#13112a] border-purple-500/30 text-white">
                  <DropdownMenuLabel className="text-white/60 text-xs">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-purple-500/20 cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  {hasBusinessListings && (
                    <DropdownMenuItem onClick={() => navigate("/business-dashboard")} className="hover:bg-purple-500/20 cursor-pointer">
                      <Building2 className="w-4 h-4 mr-2" /> Business Dashboard
                    </DropdownMenuItem>
                  )}
                  {hasOrganizerProfile && (
                    <DropdownMenuItem onClick={() => navigate("/organizer")} className="hover:bg-purple-500/20 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Organizer Dashboard
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="hover:bg-purple-500/20 cursor-pointer">
                      <Shield className="w-4 h-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-red-500/20 text-red-400 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/70 transition-all"
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500/20 animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link to="/categories" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-[hsl(40_85%_68%)] py-2 transition-colors text-sm font-medium">Browse</Link>
              <Link to="/events" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-[hsl(40_85%_68%)] py-2 transition-colors text-sm font-medium">Events</Link>
              <Link to="/list-business" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-[hsl(40_85%_68%)] py-2 transition-colors text-sm font-medium">List Business</Link>
              <Link to="/search" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-[hsl(40_85%_68%)] py-2 transition-colors text-sm font-medium">Search</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
