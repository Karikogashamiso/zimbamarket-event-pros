import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  MapPin, 
  Star, 
  Heart, 
  Calendar,
  Users,
  Clock,
  Shield,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Building2,
  Utensils,
  Music,
  Camera,
  Palette,
  Car,
  Flower,
  Eye,
  Grid3X3,
  List,
  ChevronDown
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState('all');
  const [rating, setRating] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // Use real data hooks
  const { categories } = useCategories();
  const { services, loading, error } = useServices({
    query: searchQuery,
    location: location,
    category: category,
    priceRange: priceRange,
    rating: rating
  });

  // Handle search form submission
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (category !== 'all') params.set('category', category);
    setSearchParams(params);
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
          <img 
            src={result.image_url || "/placeholder.svg"} 
            alt={result.title}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
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
              <Button className="w-full hover-scale" size="sm">
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
      <Helmet>
        <title>Search Results - Find Event Services | ZimEventPro</title>
        <meta name="description" content="Browse verified event professionals across Zimbabwe. Find venues, caterers, DJs, photographers and more for your perfect celebration." />
      </Helmet>

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
              
              {/* Enhanced Search Bar */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for venues, caterers, DJs..."
                      className="pl-12 h-12 border-0 bg-gray-50 focus:bg-white text-gray-800"
                    />
                  </div>
                  
                  <div className="lg:col-span-4 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location in Zimbabwe"
                      className="pl-12 h-12 border-0 bg-gray-50 focus:bg-white text-gray-800"
                    />
                  </div>
                  
                  <div className="lg:col-span-3">
                    <Button className="w-full h-12 text-base font-semibold hover-scale">
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Sidebar Filters */}
              <aside className="lg:col-span-1">
                <Card className="p-6 sticky top-24">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h3>
                  
                  {/* Categories */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h4>
                    <div className="space-y-2">
                      {categoryTabs.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between hover:bg-muted/50 ${
                            category === cat.id ? 'bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          <span className="text-sm">{cat.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {cat.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  {/* Price Range */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Price Range</h4>
                    <div className="space-y-2">
                      {['all', '$0-$100', '$100-$500', '$500-$1000', '$1000+'].map((range) => (
                        <label key={range} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                          <input 
                            type="radio" 
                            name="price" 
                            value={range}
                            checked={priceRange === range}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="text-primary"
                          />
                          <span className="text-sm">{range === 'all' ? 'Any Price' : range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  {/* Rating */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Minimum Rating</h4>
                    <div className="space-y-2">
                      {['all', '4.5', '4.0', '3.5', '3.0'].map((rate) => (
                        <label key={rate} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                          <input 
                            type="radio" 
                            name="rating" 
                            value={rate}
                            checked={rating === rate}
                            onChange={(e) => setRating(e.target.value)}
                            className="text-primary"
                          />
                          <div className="flex items-center gap-1">
                            {rate !== 'all' ? (
                              <>
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{rate}+ stars</span>
                              </>
                            ) : (
                              <span className="text-sm">Any Rating</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>
              </aside>

              {/* Results */}
              <main className="lg:col-span-3">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Search Results</h2>
                    <p className="text-muted-foreground">
                      {loading ? 'Loading...' : `Found ${services.length} services matching your criteria`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                      >
                        <option value="relevance">Most Relevant</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                      </select>
                    </div>
                    
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