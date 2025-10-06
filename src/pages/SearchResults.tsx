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

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    priceRange: { min: 0, max: 10000 },
    rating: 0,
    availability: [],
    capacity: { min: 1, max: 1000 },
    amenities: [],
    featured: false,
    verified: false,
    sortBy: 'relevance',
  });

  // Use real data hooks
  const { categories } = useCategories();
  const { services, loading, error } = useServices({
    query: searchFilters.query,
    location: searchFilters.location,
    category: searchFilters.category,
    featured: searchFilters.featured,
  });

  // Handle search form submission
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    setSearchParams(params);
    
    // Track search
    trackSearch(filters.query, filters.location, filters.category);
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
    if (cardLoading) {
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
            {result.featured && (
              <Badge className="bg-secondary text-white font-semibold shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {result.verified && (
              <Badge className="bg-primary text-white font-semibold shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white text-gray-600 hover:text-accent shadow-lg">
              <Heart className="w-4 h-4" />
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
            <Button variant="outline" size="sm" className="hover-scale">
              <Calendar className="w-4 h-4" />
            </Button>
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
                      {loading ? 'Loading...' : `Found ${services.length} services matching your criteria`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <select 
                      value={searchFilters.sortBy}
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

                {!loading && services.length > 0 && (
                  <div className="text-center mt-12">
                    <Button variant="outline" size="lg" className="hover-scale">
                      Load More Results
                      <ChevronDown className="w-4 h-4 ml-2" />
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