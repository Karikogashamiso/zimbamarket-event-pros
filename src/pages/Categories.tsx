import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MetaTags from "@/components/SEO/MetaTags";
import StructuredData from "@/components/SEO/StructuredData";
import { useCategories } from "@/hooks/useCategories";
import { 
  Building2, 
  Utensils, 
  Music, 
  Camera, 
  Users, 
  Cake,
  Car,
  Flower,
  Palette,
  Mic2,
  Video,
  Wine,
  Sparkles,
  Shield,
  Guitar,
  Sun,
  Volume2,
  ImageIcon,
  ChefHat,
  Clock,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  ArrowRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const { categories, loading, error } = useCategories();
  const searchSectionRef = useRef<HTMLElement>(null);
  
  // Get category from URL parameters
  const selectedCategory = searchParams.get('category') || 'all';

  // Update URL when category changes
  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    
    // Keep existing search query if present
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    
    setSearchParams(newParams);
    
    // Scroll to search section smoothly
    setTimeout(() => {
      searchSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Handle category card clicks - navigate to search results with category filter
  const handleCategoryCardClick = (category: any) => {
    navigate(`/search?category=${category.slug}`);
  };

  // Initialize search query from URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Update URL when search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    
    if (query.trim()) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    
    setSearchParams(newParams);
  };

  // Handle search submission - navigate to search results
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle Enter key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Icon mapping for categories
  const iconMap: { [key: string]: any } = {
    'Building2': Building2,
    'Utensils': Utensils,
    'Music': Music,
    'Camera': Camera,
    'Users': Users,
    'Cake': Cake,
    'Car': Car,
    'Flower': Flower,
    'Palette': Palette,
    'Mic2': Mic2,
    'Video': Video,
    'Wine': Wine,
    'Sparkles': Sparkles,
    'Shield': Shield,
    'Guitar': Guitar,
    'Sun': Sun,
    'Volume2': Volume2,
    'ImageIcon': ImageIcon,
    'ChefHat': ChefHat,
    'Clock': Clock,
  };

  // Transform database categories to display format
  const allCategories = categories.map((cat, index) => ({
    icon: iconMap[cat.icon] || Building2,
    title: cat.name,
    description: cat.description || '',
    count: `${cat.service_count || 0} services`,
    color: `bg-gradient-to-br from-${['blue', 'green', 'red', 'indigo', 'pink', 'emerald', 'orange', 'cyan', 'yellow', 'violet', 'teal', 'rose', 'slate', 'gray', 'amber', 'lime', 'fuchsia'][index % 17]}-500 to-${['blue', 'green', 'red', 'indigo', 'pink', 'emerald', 'orange', 'cyan', 'yellow', 'violet', 'teal', 'rose', 'slate', 'gray', 'amber', 'lime', 'fuchsia'][index % 17]}-600`,
    trending: cat.service_count && cat.service_count > 10,
    slug: cat.slug,
    category: cat.slug
  }));

  const categoryTabs = [
    { id: "all", label: "All Services", count: allCategories.length },
    ...categories.slice(0, 8).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: cat.service_count || 0
    }))
  ];

  const filteredCategories = allCategories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || category.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get dynamic counts from categories
  const venuesCategory = categories.find(c => c.slug === 'venues');
  const totalServices = categories.reduce((sum, cat) => sum + (cat.service_count || 0), 0);

  return (
    <>
      <MetaTags
        title={`Browse Event Service Categories${selectedCategory !== 'all' ? ` - ${categoryTabs.find(c => c.id === selectedCategory)?.label}` : ''} | ZimEventPro`}
        description="Explore all event service categories in Zimbabwe. Find venues, caterers, DJs, photographers, decorators, and more for your perfect celebration."
        keywords="event services Zimbabwe, categories, venues, catering, DJs, photography, event planning"
        type="website"
      />

      <StructuredData
        type="WebSite"
        data={{
          name: "ZimEventPro Categories",
          description: "Browse all event service categories",
          url: "https://zimeventpro.com/categories"
        }}
      />

      <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-2 mb-6">
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium">All Categories</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Browse All <span className="text-secondary">Services</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Find everything you need for your perfect event from Zimbabwe's largest network of verified professionals.
            </p>
            
            {/* List Business CTA */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-8">
              <h3 className="text-2xl font-bold mb-4">Are you a service provider?</h3>
              <p className="text-white/90 mb-6">Join Zimbabwe's premier event marketplace and grow your business</p>
            <Link to="/list-business">
              <Button variant="hero" size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                <Plus className="w-5 h-5 mr-2" />
                List My Business or Venue
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section ref={searchSectionRef} className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search services, venues, or professionals..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearchSubmit}
                  className="h-12 px-6"
                  disabled={!searchQuery.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-12 w-12"
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-12 w-12"
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="mb-8">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto p-1">
                {categoryTabs.slice(0, 5).map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex flex-col p-3 h-auto text-xs"
                  >
                    <span className="font-medium">{tab.label}</span>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Additional tabs for mobile */}
              <div className="flex flex-wrap gap-2 mt-4 lg:hidden">
                {categoryTabs.slice(5).map((tab) => (
                  <Button
                    key={tab.id}
                    variant={selectedCategory === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(tab.id)}
                    className="h-auto p-2"
                  >
                    {tab.label} ({tab.count})
                  </Button>
                ))}
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-16 rounded-2xl mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading categories. Please try again.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {filteredCategories.length} Services Available
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending services marked</span>
                </div>
              </div>

              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1 max-w-4xl mx-auto"
              }`}>
            {filteredCategories.map((category, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer hover-scale transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                onClick={() => handleCategoryCardClick(category)}
              >
                <CardContent className="p-6">
                  <div className={`flex ${viewMode === "list" ? "flex-row items-center gap-6" : "flex-col items-center text-center"}`}>
                    <div className="relative">
                      <div className={`${category.color} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      {category.trending && (
                        <div className="absolute -top-2 -right-2 bg-secondary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Hot
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-1 ${viewMode === "list" ? "text-left" : "text-center mt-4"}`}>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-primary border-primary">
                          {category.count}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Collections
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="overflow-hidden hover-scale transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => handleCategoryCardClick({ slug: venuesCategory?.slug || 'venues' })}>
              <div className="relative h-64 bg-gradient-to-br from-primary to-primary/80">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">VENUES</h3>
                  <p className="text-white/90 mb-3">Discover premium event spaces</p>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {venuesCategory?.service_count || 0} Available
                  </Badge>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden hover-scale transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => navigate('/search')}>
              <div className="relative h-64 bg-gradient-to-br from-secondary to-secondary/80">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">ALL SERVICES</h3>
                  <p className="text-white/90 mb-3">Complete event solutions</p>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {totalServices} Total
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Categories;