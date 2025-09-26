import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Filter, 
  MapPin, 
  Heart, 
  Share2, 
  Phone, 
  MessageCircle,
  Star,
  Calendar,
  Users,
  Clock,
  Menu,
  ArrowLeft,
  Home,
  User,
  Settings
} from "lucide-react";

const MobileFirstDesign = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  
  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Handle Enter key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white border rounded-3xl overflow-hidden shadow-2xl">
      {/* Status Bar Simulation */}
      <div className="h-6 bg-black flex items-center justify-center">
        <div className="flex items-center justify-between w-full px-4">
          <span className="text-white text-xs font-medium">9:41 AM</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3 h-1 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold">ZimEventPro</h1>
            <p className="text-xs opacity-90">📍 Harare, Zimbabwe</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <User className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="relative flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events, venues, services..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10 pr-4 bg-white/90 border-0 rounded-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSearchSubmit}
            size="sm"
            className="rounded-full"
            disabled={!searchValue.trim()}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: "Events", color: "bg-blue-500" },
            { icon: MapPin, label: "Venues", color: "bg-green-500" },
            { icon: Users, label: "Catering", color: "bg-purple-500" },
            { icon: Phone, label: "Support", color: "bg-orange-500" }
          ].map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-2`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Mobile Optimized Cards */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {/* Featured Service Card */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Featured This Week</h3>
            <Badge variant="secondary" className="text-xs">Popular</Badge>
          </div>
          
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Image placeholder */}
              <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button size="icon" variant="ghost" className="w-8 h-8 bg-white/80 hover:bg-white">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="w-8 h-8 bg-white/80 hover:bg-white">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Royal Gardens Wedding Venue</h4>
                  <p className="text-xs text-muted-foreground">Luxury venue • Highlands</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">$500+</div>
                  <div className="text-xs text-muted-foreground">per event</div>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs ml-1 font-medium">4.9</span>
                  <span className="text-xs text-muted-foreground ml-1">(127)</span>
                </div>
                <div className="ml-auto flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  Responds in 2h
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="text-xs h-8">
                  Book Now
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick List View */}
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">More Options</h3>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">EliteBeats DJ Services</h4>
                  <p className="text-xs text-muted-foreground">Professional DJ • Victoria Falls</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs ml-1">5.0</span>
                    <Badge variant="outline" className="ml-auto text-xs">$200+</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="border-t bg-white">
        <div className="grid grid-cols-5 py-2">
          {[
            { icon: Home, label: "Home", id: "home" },
            { icon: Search, label: "Search", id: "search" },
            { icon: Heart, label: "Saved", id: "saved" },
            { icon: MessageCircle, label: "Chat", id: "chat" },
            { icon: User, label: "Profile", id: "profile" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                activeTab === tab.id 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Floating Action */}
      <div className="absolute bottom-20 right-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary">
              <Filter className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-96">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Filter & Sort</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Harare", "Bulawayo", "Victoria Falls"].map((city) => (
                      <Button key={city} variant="outline" size="sm" className="text-xs">
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["$0-200", "$200-500", "$500+"].map((range) => (
                      <Button key={range} variant="outline" size="sm" className="text-xs">
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full mt-4">Apply Filters</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileFirstDesign;