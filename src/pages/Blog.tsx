import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  BookOpen,
  TrendingUp,
  Star,
  Heart,
  Share2,
  MessageCircle,
  Eye,
  Tag,
  Search
} from "lucide-react";
import { useState } from "react";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Posts" },
    { id: "wedding", label: "Wedding Planning" },
    { id: "corporate", label: "Corporate Events" },
    { id: "tips", label: "Event Tips" },
    { id: "trends", label: "Industry Trends" },
    { id: "vendor", label: "Vendor Spotlight" }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "10 Must-Have Features for Your Dream Wedding Venue in Zimbabwe",
      excerpt: "Planning a wedding in Zimbabwe? Discover the essential features to look for when choosing your perfect wedding venue, from traditional garden settings to modern conference halls.",
      author: "Sarah Mukamuri",
      date: "2024-01-15",
      category: "wedding",
      readTime: "5 min read",
      views: 1250,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
      featured: true,
      tags: ["Wedding Venues", "Zimbabwe", "Planning Tips"]
    },
    {
      id: 2,
      title: "Corporate Event Trends 2024: What's Hot in Zimbabwe's Business Scene",
      excerpt: "Stay ahead of the curve with the latest corporate event trends making waves in Zimbabwe. From hybrid events to sustainable practices, discover what's shaping the industry.",
      author: "David Chikwanha",
      date: "2024-01-12",
      category: "corporate",
      readTime: "7 min read",
      views: 890,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
      featured: false,
      tags: ["Corporate Events", "Trends", "Business"]
    },
    {
      id: 3,
      title: "How to Plan a Traditional Zimbabwean Wedding: A Complete Guide",
      excerpt: "Honor your heritage while creating a memorable celebration. This comprehensive guide covers everything from traditional ceremonies to modern twists on classic customs.",
      author: "Grace Mutasa",
      date: "2024-01-10",
      category: "wedding",
      readTime: "10 min read",
      views: 2100,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
      featured: true,
      tags: ["Traditional Wedding", "Culture", "Zimbabwe"]
    },
    {
      id: 4,
      title: "Budget-Friendly Event Planning: Maximum Impact, Minimum Cost",
      excerpt: "Create stunning events without breaking the bank. Learn insider tips from Zimbabwe's top event planners on how to stretch your budget while maintaining quality.",
      author: "Michael Banda",
      date: "2024-01-08",
      category: "tips",
      readTime: "6 min read",
      views: 1450,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
      featured: false,
      tags: ["Budget Planning", "Tips", "Cost Saving"]
    },
    {
      id: 5,
      title: "Vendor Spotlight: Meet Zimbabwe's Rising Catering Stars",
      excerpt: "Discover the talented chefs and catering companies making a mark in Zimbabwe's event scene. From traditional cuisine to international flavors, meet the culinary artists.",
      author: "Jennifer Moyo",
      date: "2024-01-05",
      category: "vendor",
      readTime: "8 min read",
      views: 720,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
      featured: false,
      tags: ["Vendors", "Catering", "Spotlight"]
    },
    {
      id: 6,
      title: "The Ultimate Event Timeline: 12 Months to Your Perfect Day",
      excerpt: "Never miss a deadline again! Our comprehensive 12-month event planning timeline ensures you stay organized and stress-free throughout your planning journey.",
      author: "Patricia Dube",
      date: "2024-01-03",
      category: "tips",
      readTime: "12 min read",
      views: 1800,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
      featured: false,
      tags: ["Timeline", "Organization", "Planning"]
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">ZimEventPro Blog</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Event Planning <span className="text-primary">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Expert tips, industry trends, and inspiring stories from Zimbabwe's premier event planning community.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search articles, tips, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-12">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Featured Posts */}
            {selectedCategory === "all" && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                  <Star className="w-6 h-6 text-secondary" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover-scale transition-all duration-300 hover:shadow-xl">
                      <div className="relative">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-secondary">
                          Featured
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl mb-3 hover:text-primary transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="group">
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-3xl font-bold mb-8">
                {selectedCategory === "all" ? "Latest Articles" : `${categories.find(c => c.id === selectedCategory)?.label} Articles`}
              </h2>
              <div className="space-y-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <CardContent className="md:w-2/3 p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl mb-3 hover:text-primary transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="group">
                              Read More
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8 sticky top-24">
              
              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl">Stay Updated</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground mb-4">
                    Subscribe to our newsletter to stay updated on events and news.
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="Enter your email" type="email" />
                    <Button className="w-full bg-secondary hover:bg-secondary/90">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Posts */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl">Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex gap-3 group cursor-pointer">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-wrap gap-2">
                    {["Wedding Planning", "Corporate Events", "Zimbabwe", "Budget Tips", "Vendors", "Traditional", "Modern", "Planning Timeline"].map((tag, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;