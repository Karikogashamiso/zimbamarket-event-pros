import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, 
  MapPin, 
  Heart, 
  Calendar,
  CheckCircle,
  ArrowUpRight,
  Sparkles,
  Shield,
  Eye,
  Grid3X3,
  List,
  ChevronDown,
  Clock
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import LazyImage from "@/components/LazyImage";
import AdvancedSearch, { SearchFilters } from "@/components/Search/AdvancedSearch";
import MetaTags from "@/components/SEO/MetaTags";
import StructuredData from "@/components/SEO/StructuredData";
import { trackServiceView, trackSearch } from "@/components/Analytics/GoogleAnalytics";
import { toast } from "sonner";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);

  // Load saved services from localStorage
  useEffect(() => {
    const savedIds = localStorage.getItem('savedServices');
    if (savedIds) {
      try {
        setSavedServiceIds(JSON.parse(savedIds));
      } catch (error) {
        console.error('Error parsing saved services:', error);
      }
    }
  }, []);

  // Toggle save/unsave service
  const toggleSaveService = (serviceId: string, serviceName: string) => {
    const savedIds = localStorage.getItem('savedServices');
    let ids = savedIds ? JSON.parse(savedIds) : [];
    
    if (ids.includes(serviceId)) {
      // Remove from saved
      ids = ids.filter((id: string) => id !== serviceId);
      localStorage.setItem('savedServices', JSON.stringify(ids));
      setSavedServiceIds(ids);
      toast.success('Removed from favorites', {
        description: `${serviceName} has been removed from your favorites.`
      });
    } else {
      // Add to saved
      ids.push(serviceId);
      localStorage.setItem('savedServices', JSON.stringify(ids));
      setSavedServiceIds(ids);
      toast.success('Added to favorites', {
        description: `${serviceName} has been added to your favorites.`
      });
    }
  };
  
  // Helper function to parse URL params into proper SearchFilters format
  const parseFiltersFromParams = (): Partial<SearchFilters> => {
    const filters: Partial<SearchFilters> = {
      query: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      category: searchParams.get('category') || '',
      featured: searchParams.get('featured') === 'true',
      verified: searchParams.get('verified') === 'true',
      rating: 0,
      priceRange: { min: 0, max: 10000 },
      capacity: { min: 1, max: 1000 },
      amenities: [],
      availability: [],
      sortBy: 'relevance',
    };

    // Parse price range from URL
    const priceRangeParam = searchParams.get('priceRange');
    if (priceRangeParam === 'budget') {
      filters.priceRange = { min: 100, max: 500 };
    } else if (priceRangeParam === 'mid') {
      filters.priceRange = { min: 500, max: 1500 };
    } else if (priceRangeParam === 'premium') {
      filters.priceRange = { min: 1500, max: 5000 };
    } else if (priceRangeParam === 'luxury') {
      filters.priceRange = { min: 5000, max: 10000 };
    }

    // Parse capacity from URL
    const capacityParam = searchParams.get('capacity');
    if (capacityParam === 'intimate') {
      filters.capacity = { min: 1, max: 50 };
    } else if (capacityParam === 'medium') {
      filters.capacity = { min: 50, max: 150 };
    } else if (capacityParam === 'large') {
      filters.capacity = { min: 150, max: 300 };
    } else if (capacityParam === 'grand') {
      filters.capacity = { min: 300, max: 1000 };
    }

    return filters;
  };

  const [searchFilters, setSearchFilters] = useState<Partial<SearchFilters>>(parseFiltersFromParams);

  // Update filters when URL params change
  useEffect(() => {
    setSearchFilters(parseFiltersFromParams());
  }, [searchParams]);

  // Use real data hooks
  const { categories } = useCategories();
  const { 
    services, 
    loading, 
    error, 
    loadMore, 
    hasMore, 
    loadingMore, 
    totalCount 
  } = useServices(searchFilters);

  // Handle search form submission
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    if (filters.featured) params.set('featured', 'true');
    if (filters.verified) params.set('verified', 'true');
    
    // Convert price range back to simple string for URL
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 10000)) {
      if (filters.priceRange.min === 100 && filters.priceRange.max === 500) {
        params.set('priceRange', 'budget');
      } else if (filters.priceRange.min === 500 && filters.priceRange.max === 1500) {
        params.set('priceRange', 'mid');
      } else if (filters.priceRange.min === 1500 && filters.priceRange.max === 5000) {
        params.set('priceRange', 'premium');
      } else if (filters.priceRange.min === 5000) {
        params.set('priceRange', 'luxury');
      }
    }
    
    // Convert capacity back to simple string for URL
    if (filters.capacity && (filters.capacity.min > 1 || filters.capacity.max < 1000)) {
      if (filters.capacity.max === 50) {
        params.set('capacity', 'intimate');
      } else if (filters.capacity.min === 50 && filters.capacity.max === 150) {
        params.set('capacity', 'medium');
      } else if (filters.capacity.min === 150 && filters.capacity.max === 300) {
        params.set('capacity', 'large');
      } else if (filters.capacity.min === 300) {
        params.set('capacity', 'grand');
      }
    }
    
    setSearchParams(params);
    
    // Track search
    trackSearch(filters.query || '', filters.location || '', filters.category || '');
  };

  const categoryTabs = [
    { id: 'all', name: 'All Services', count: services.length },
    ...categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      count: services.filter(s => s.category?.slug === cat.slug).length
    }))
  ];

  const ResultCard = ({ result, isLoading: cardLoading }: { result: any, isLoading: boolean }) => {
    const isSaved = result ? savedServiceIds.includes(result.id) : false;
    
    if (cardLoading || !result) {
      return (
        <Card className="overflow-hidden">
          <div className="w-full h-48 bg-muted animate-pulse"></div>
          <CardContent className="p-6">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse mb-4"></div>
            <div className="h-3 w-full bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-3 w-5/6 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="group overflow-hidden hover-lift border-0 shadow-elegant hover:shadow-2xl transition-all duration-500">
        <div className="relative overflow-hidden">
        <LazyImage 
          src={result.image_url || "/placeholder.svg"} 
          alt={result.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          placeholder="/placeholder.svg"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAAVAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAGhEAAwEBAQAAAAAAAAAAAAAAAAECEQMh/9oADAMBAAIRAxEAPwA5AAAD/9k="
        />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {result.is_featured && (
              <Badge className="bg-secondary text-white font-semibold shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {result.is_verified && (
              <Badge className="bg-primary text-white font-semibold shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`bg-white/90 hover:bg-white shadow-lg transition-colors ${
                isSaved ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'
              }`}
              onClick={(e) => {
                e.preventDefault();
                toggleSaveService(result.id, result.title);
              }}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Link to={`/service/${result.id}`}>
              <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white text-gray-600 hover:text-primary shadow-lg">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="absolute bottom-4 left-4">
            <Badge variant="default" className="shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              {result.availability_status || 'Available'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs font-medium">
              {result.category?.name || 'Service'}
            </Badge>
          </div>
          
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-display">
            {result.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
            {result.description}
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{result.location}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{result.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({result.review_count} reviews)
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {result.price_from ? `From $${result.price_from}` : 'Contact for pricing'}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {result.response_time}
          </div>
          
          <div className="flex gap-2">
            <Link to={`/service/${result.id}`} className="flex-1">
              <Button 
                className="w-full hover-scale" 
                size="sm"
                onClick={() => trackServiceView(result.id, result.title)}
              >
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to={`/service/${result.id}?action=book`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover-scale"
                title="Book Now"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <MetaTags
        title="Search Results - Find Event Services | ZimEventPro"
        description="Browse verified event professionals across Zimbabwe. Find venues, caterers, DJs, photographers and more for your perfect celebration."
        keywords="event services Zimbabwe, search results, venues, caterers, DJs"
        type="website"
      />

      <StructuredData
        type="WebSite"
        data={{
          name: "ZimEventPro Search Results",
          description: "Search results for event services",
          url: "https://zimeventpro.com/search"
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Header Spacer */}
        <div className="h-20"></div>
        
        {/* Enhanced Search Header */}
        <section className="bg-gradient-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Find Your Perfect Event Services
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Discover and book trusted professionals across Zimbabwe
              </p>
              
              {/* Advanced Search Component */}
              <AdvancedSearch
                onSearch={handleSearch}
                initialFilters={searchFilters}
                isLoading={loading}
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Results Header and Controls */}
              <main className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Search Results</h2>
                    <p className="text-muted-foreground">
                      {loading 
                        ? 'Loading...' 
                        : `Showing ${services.length} of ${totalCount} services matching your criteria`
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <select 
                      value={searchFilters.sortBy || 'relevance'}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    >
                      <option value="relevance">Most Relevant</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
                    
                    <div className="flex border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <ResultCard key={i} result={null} isLoading={true} />
                    ))
                  ) : (
                    services.map((result) => (
                      <ResultCard key={result.id} result={result} isLoading={false} />
                    ))
                  )}
                </div>

                {/* Load More Button */}
                {!loading && services.length > 0 && hasMore && (
                  <div className="text-center mt-12">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="hover-scale" 
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Loading More...
                        </>
                      ) : (
                        <>
                          Load More Results
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing {services.length} of {totalCount} results
                    </p>
                  </div>
                )}

                {/* No More Results Message */}
                {!loading && services.length > 0 && !hasMore && (
                  <div className="text-center mt-12 py-8 border-t border-border">
                    <p className="text-muted-foreground">
                      You've seen all {totalCount} results matching your criteria.
                    </p>
                    <Button 
                      variant="ghost" 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="mt-2"
                    >
                      Back to Top
                    </Button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SearchResults;