import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  X, 
  Calendar,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";

// Mock data for suggestions
const popularSearches = [
  "Wedding Venues in Harare", 
  "Corporate Event Catering",
  "Birthday Party Photography", 
  "DJ Services Bulawayo",
  "Wedding Planners Victoria Falls"
];

const trendingNow = [
  "Garden Wedding Venues",
  "Live Band Entertainment", 
  "Cocktail Catering",
  "Event Photography"
];

const recentSearches = [
  "Wedding DJ Harare",
  "Corporate Venue Bulawayo", 
  "Catering Services"
];

const EnhancedSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update active filters array when filters change
    const filters = [];
    if (category) filters.push(`Category: ${category}`);
    if (priceRange) filters.push(`Budget: ${priceRange}`);
    if (guestCount) filters.push(`Guests: ${guestCount}`);
    if (location) filters.push(`Location: ${location}`);
    setActiveFilters(filters);
  }, [category, priceRange, guestCount, location]);

  const clearFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith('Category:')) setCategory('');
    if (filterToRemove.startsWith('Budget:')) setPriceRange('');
    if (filterToRemove.startsWith('Guests:')) setGuestCount('');
    if (filterToRemove.startsWith('Location:')) setLocation('');
  };

  const clearAllFilters = () => {
    setCategory('');
    setPriceRange('');
    setGuestCount('');
    setLocation('');
    setEventDate('');
  };

  const handleSearch = () => {
    // Clear any previous errors
    setError(null);
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (location.trim()) params.set('location', location.trim());
    if (category) params.set('category', category);
    if (priceRange) params.set('priceRange', priceRange);
    if (guestCount) params.set('capacity', guestCount);
    if (eventDate) params.set('date', eventDate);
    
    try {
      navigate(`/search?${params.toString()}`);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Unable to perform search. Please try again.');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Auto-search when clicking a suggestion
    const params = new URLSearchParams();
    params.set('q', suggestion);
    if (location.trim()) params.set('location', location.trim());
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Search Bar */}
      <Card className="card-elegant p-6 mb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={handleKeyPress}
              placeholder="Search for venues, catering, photography..."
              className="pl-12 h-12 text-base border-0 bg-muted/50 focus:bg-background transition-all"
            />
          </div>
          
          {/* Location Input */}
          <div className="flex-1 relative group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Harare, Bulawayo, Victoria Falls..."
              className="pl-12 h-12 text-base border-0 bg-muted/50 focus:bg-background transition-all"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 px-4 ${showFilters ? 'bg-primary text-white' : ''}`}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
            <Button variant="hero" size="lg" className="h-12 px-8" onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {activeFilters.map((filter, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 px-3 py-1"
              >
                {filter}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => clearFilter(filter)}
                />
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs h-6 px-2"
            >
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="card-elegant p-6 mb-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venues">Venues</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="decor">Decor & Styling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Budget Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Any Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">$100 - $500</SelectItem>
                  <SelectItem value="mid">$500 - $1,500</SelectItem>
                  <SelectItem value="premium">$1,500 - $5,000</SelectItem>
                  <SelectItem value="luxury">$5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Guest Count</label>
              <Select value={guestCount} onValueChange={setGuestCount}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Any Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intimate">1 - 50 guests</SelectItem>
                  <SelectItem value="medium">50 - 150 guests</SelectItem>
                  <SelectItem value="large">150 - 300 guests</SelectItem>
                  <SelectItem value="grand">300+ guests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="pl-10 h-10"
                  placeholder="Event Date"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search Suggestions */}
      {showSuggestions && (
        <Card className="card-elegant p-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Popular Searches */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary" />
                Popular Searches
              </h4>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 p-2 rounded transition-all"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Trending Now
              </h4>
              <div className="space-y-2">
                {trendingNow.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(trend)}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 p-2 rounded transition-all"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Recent Searches
              </h4>
              <div className="space-y-2">
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(recent)}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 p-2 rounded transition-all"
                  >
                    {recent}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSearch;