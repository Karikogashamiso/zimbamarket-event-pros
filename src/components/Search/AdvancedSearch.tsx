import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Users,
  DollarSign,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { trackSearch } from '@/components/Analytics/GoogleAnalytics';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  isLoading?: boolean;
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  availability: string[];
  capacity: {
    min: number;
    max: number;
  };
  amenities: string[];
  featured: boolean;
  verified: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'distance';
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialFilters,
  isLoading = false
}) => {
  const { categories } = useCategories();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters?.query || '',
    location: initialFilters?.location || '',
    category: initialFilters?.category || '',
    priceRange: initialFilters?.priceRange || { min: 0, max: 10000 },
    rating: initialFilters?.rating || 0,
    availability: initialFilters?.availability || [],
    capacity: initialFilters?.capacity || { min: 1, max: 1000 },
    amenities: initialFilters?.amenities || [],
    featured: initialFilters?.featured || false,
    verified: initialFilters?.verified || false,
    sortBy: initialFilters?.sortBy || 'relevance',
  });

  // Sync filters with initialFilters when they change (e.g., from URL params)
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        query: initialFilters.query || '',
        location: initialFilters.location || '',
        category: initialFilters.category || '',
        priceRange: initialFilters.priceRange || { min: 0, max: 10000 },
        rating: initialFilters.rating || 0,
        availability: initialFilters.availability || [],
        capacity: initialFilters.capacity || { min: 1, max: 1000 },
        amenities: initialFilters.amenities || [],
        featured: initialFilters.featured || false,
        verified: initialFilters.verified || false,
        sortBy: initialFilters.sortBy || 'relevance',
      });
    }
  }, [initialFilters]);

  const availabilityOptions = [
    'Available now',
    'Available this week',
    'Available this month',
    'Flexible dates'
  ];

  const amenityOptions = [
    'Parking',
    'WiFi',
    'Air Conditioning',
    'Sound System',
    'Kitchen Facilities',
    'Outdoor Space',
    'Decorations Included',
    'Tables & Chairs',
    'Stage/Platform',
    'Restrooms',
    'Security',
    'Backup Power'
  ];

  const priceRanges = [
    { label: 'Any Price', min: 0, max: 10000 },
    { label: '$0 - $100', min: 0, max: 100 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: '$500 - $1,000', min: 500, max: 1000 },
    { label: '$1,000 - $5,000', min: 1000, max: 5000 },
    { label: '$5,000+', min: 5000, max: 10000 },
  ];

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback((key: 'availability' | 'amenities', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  }, []);

  const handleSearch = () => {
    // Track search analytics
    trackSearch(filters.query, filters.location, filters.category);
    
    onSearch(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      location: '',
      category: '',
      priceRange: { min: 0, max: 10000 },
      rating: 0,
      availability: [],
      capacity: { min: 1, max: 1000 },
      amenities: [],
      featured: false,
      verified: false,
      sortBy: 'relevance' as const,
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
    setIsExpanded(false); // Close the filter section
  };

  const activeFiltersCount = [
    filters.category && filters.category !== '',
    filters.priceRange.min > 0 || filters.priceRange.max < 10000,
    filters.rating > 0,
    filters.availability.length > 0,
    filters.capacity.min > 1 || filters.capacity.max < 1000,
    filters.amenities.length > 0,
    filters.featured,
    filters.verified,
  ].filter(Boolean).length;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Basic Search */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search venues, caterers, DJs..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>

            <div className="md:col-span-4 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Location in Zimbabwe"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.featured ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('featured', !filters.featured)}
            >
              Featured Only
            </Button>
            <Button
              variant={filters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('verified', !filters.verified)}
            >
              Verified Only
            </Button>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="distance">Nearest</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <>
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={filters.priceRange.min === range.min && filters.priceRange.max === range.max}
                          onChange={() => updateFilter('priceRange', { min: range.min, max: range.max })}
                          className="text-primary"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <div className="space-y-2">
                    {[0, 3, 3.5, 4, 4.5, 5].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => updateFilter('rating', rating)}
                          className="text-primary"
                        />
                        <div className="flex items-center gap-1">
                          {rating === 0 ? (
                            <span className="text-sm">Any Rating</span>
                          ) : (
                            <>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{rating}+ stars</span>
                            </>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Guest Capacity</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.capacity.min}
                        onChange={(e) => updateFilter('capacity', { 
                          ...filters.capacity, 
                          min: parseInt(e.target.value) || 1 
                        })}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.capacity.max}
                        onChange={(e) => updateFilter('capacity', { 
                          ...filters.capacity, 
                          max: parseInt(e.target.value) || 1000 
                        })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <div className="space-y-2">
                    {availabilityOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.availability.includes(option)}
                          onChange={() => toggleArrayFilter('availability', option)}
                          className="text-primary"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Amenities</label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => toggleArrayFilter('amenities', amenity)}
                          className="text-primary"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <Badge variant="secondary" className="gap-1">
                        Category: {categories.find(c => c.slug === filters.category)?.name}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => updateFilter('category', '')}
                        />
                      </Badge>
                    )}
                    {(filters.priceRange.min > 0 || filters.priceRange.max < 10000) && (
                      <Badge variant="secondary" className="gap-1">
                        Price: ${filters.priceRange.min} - ${filters.priceRange.max}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => updateFilter('priceRange', { min: 0, max: 10000 })}
                        />
                      </Badge>
                    )}
                    {filters.rating > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        Rating: {filters.rating}+ stars
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => updateFilter('rating', 0)}
                        />
                      </Badge>
                    )}
                    {filters.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="gap-1">
                        {amenity}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => toggleArrayFilter('amenities', amenity)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={() => setIsExpanded(false)}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;