import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  Eye, 
  ThumbsUp, 
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Filter,
  Search,
  Video,
  FileText,
  Download,
  Share2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const VideoTutorials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "All Tutorials" },
    { id: "wedding", label: "Wedding Planning" },
    { id: "corporate", label: "Corporate Events" },
    { id: "basics", label: "Event Basics" },
    { id: "vendor", label: "For Vendors" },
    { id: "tips", label: "Pro Tips" }
  ];

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('video_tutorials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match component structure
      const transformedData = (data || []).map(tutorial => ({
        id: tutorial.id,
        title: tutorial.title,
        description: tutorial.description,
        duration: tutorial.duration || "0:00",
        views: tutorial.view_count || 0,
        likes: 0,
        category: tutorial.category,
        level: tutorial.difficulty_level.charAt(0).toUpperCase() + tutorial.difficulty_level.slice(1),
        instructor: "ZimEventPro Team",
        thumbnail: tutorial.thumbnail_url || "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
        featured: tutorial.is_featured,
        topics: tutorial.tags || []
      }));
      
      setTutorials(transformedData);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      toast.error('Failed to load video tutorials');
    } finally {
      setLoading(false);
    }
  };

  const resources = [
    {
      title: "Event Planning Checklist",
      description: "Comprehensive 12-month planning checklist",
      type: "PDF",
      downloads: 2400
    },
    {
      title: "Budget Planning Template",
      description: "Excel template for event budget management",
      type: "XLSX",
      downloads: 1800
    },
    {
      title: "Vendor Comparison Sheet",
      description: "Compare multiple vendors side-by-side",
      type: "PDF",
      downloads: 1500
    },
    {
      title: "Timeline Template",
      description: "Day-of-event timeline template",
      type: "DOC",
      downloads: 2100
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === "all" || tutorial.category === selectedCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredTutorials = tutorials.filter(tutorial => tutorial.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading video tutorials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/10 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-6 py-2 mb-6">
              <Video className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Learning Center</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Video <span className="text-secondary">Tutorials</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Master event planning with our comprehensive video tutorials and resources designed for Zimbabwe's event professionals.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search tutorials, topics, or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    // This filters video tutorials locally
                    console.log('Video tutorial search:', searchQuery);
                  }
                }}
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

            {/* Featured Tutorials */}
            {selectedCategory === "all" && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                  <Star className="w-6 h-6 text-secondary" />
                  Featured Tutorials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredTutorials.slice(0, 2).map((tutorial) => (
                    <Card key={tutorial.id} className="overflow-hidden hover-scale transition-all duration-300 hover:shadow-xl">
                      <div className="relative">
                        <img 
                          src={tutorial.thumbnail} 
                          alt={tutorial.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                            <Play className="w-8 h-8 text-primary ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute top-4 left-4 bg-secondary">
                          Featured
                        </Badge>
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {tutorial.duration}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {tutorial.instructor}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tutorial.level}
                          </Badge>
                        </div>
                        <Link to={`/video-tutorial/${tutorial.id}`}>
                          <h3 className="font-bold text-xl mb-3 hover:text-secondary transition-colors cursor-pointer">
                            {tutorial.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {tutorial.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {tutorial.likes}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tutorial.topics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <Link to={`/video-tutorial/${tutorial.id}`}>
                          <Button className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Watch Tutorial
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Tutorials */}
            <div>
              <h2 className="text-3xl font-bold mb-8">
                {selectedCategory === "all" ? "All Tutorials" : `${categories.find(c => c.id === selectedCategory)?.label} Tutorials`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale">
                    <div className="relative">
                      <img 
                        src={tutorial.thumbnail} 
                        alt={tutorial.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {tutorial.duration}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {tutorial.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{tutorial.instructor}</span>
                      </div>
                      <Link to={`/video-tutorial/${tutorial.id}`}>
                        <h3 className="font-bold text-lg mb-2 hover:text-secondary transition-colors cursor-pointer line-clamp-2">
                          {tutorial.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {tutorial.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {tutorial.likes}
                        </span>
                      </div>
                      <Link to={`/video-tutorial/${tutorial.id}`}>
                        <Button size="sm" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Watch Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8 sticky top-24">
              
              {/* Quick Start Guide */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground mb-4 text-sm">
                    New to event planning? Start with these essential tutorials.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Play className="w-4 h-4 mr-2" />
                      Event Planning Basics
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Play className="w-4 h-4 mr-2" />
                      Budget Planning 101
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Play className="w-4 h-4 mr-2" />
                      Vendor Selection Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Free Resources */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Free Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {resources.map((resource, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{resource.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {resource.downloads} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl">Stay Updated</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground mb-4 text-sm">
                    Get notified when new tutorials are available.
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="Enter your email" type="email" />
                    <Button size="sm" className="w-full">
                      Subscribe for Updates
                    </Button>
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

export default VideoTutorials;