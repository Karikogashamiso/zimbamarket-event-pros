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
  Share2,
  Heart
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const VideoTutorials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tutorials, setTutorials] = useState<unknown[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { user } = useAuth();

  const fetchLikedVideos = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("video_likes")
        .select("video_id")
        .eq("user_id", user.id);
      
      if (data) {
        setLikedVideos(new Set(data.map(like => like.video_id)));
      }
    } catch (error) {
      console.error("Error fetching liked videos:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user && tutorials.length > 0) {
      fetchLikedVideos();
    }
  }, [user, tutorials.length, fetchLikedVideos]);

  const handleLike = async (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please login to like videos");
      return;
    }

    const isLiked = likedVideos.has(videoId);

    try {
      if (isLiked) {
        await supabase
          .from("video_likes")
          .delete()
          .eq("video_id", videoId)
          .eq("user_id", user.id);
        
        setLikedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
        
        toast.success("Removed from favorites");
      } else {
        await supabase
          .from("video_likes")
          .insert({ video_id: videoId, user_id: user.id });
        
        setLikedVideos(prev => new Set(prev).add(videoId));
        
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async (tutorial: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/video-tutorial/${tutorial.id}`;
    const shareText = `Check out this video tutorial: ${tutorial.title}`;

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: tutorial.title,
            text: shareText,
            url: shareUrl,
          });
          toast.success("Shared successfully");
          
          await supabase.from("booking_analytics").insert({
            service_id: tutorial.id,
            event_type: "share",
            event_data: { method: "native" },
          });
          return;
        } catch (shareError) {
          // If share fails, fall through to clipboard
          console.log("Share API failed, falling back to clipboard");
        }
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
      
      await supabase.from("booking_analytics").insert({
        service_id: tutorial.id,
        event_type: "share",
        event_data: { method: "clipboard" },
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share. Please try again.");
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);
    
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email: newsletterEmail.toLowerCase().trim(),
          source: "video_tutorials",
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already subscribed");
        } else {
          throw error;
        }
      } else {
        toast.success("Successfully subscribed to updates!");
        setNewsletterEmail("");
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const categories = [
    { id: "all", label: "All Tutorials" },
    { id: "wedding", label: "Wedding Planning" },
    { id: "corporate", label: "Corporate Events" },
    { id: "basics", label: "Event Basics" },
    { id: "vendor", label: "For Vendors" },
    { id: "tips", label: "Pro Tips" }
  ];

  const fetchTutorials = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-auto p-0 ml-auto ${likedVideos.has(tutorial.id) ? "text-red-500" : ""}`}
                          onClick={(e) => handleLike(tutorial.id, e)}
                        >
                          <Heart className={`w-3 h-3 ${likedVideos.has(tutorial.id) ? "fill-current" : ""}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-auto p-0"
                          onClick={(e) => handleShare(tutorial, e)}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory("basics");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Event Planning Basics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setSearchQuery("budget");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Budget Planning 101
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory("vendor");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Vendor Selection Guide
                    </Button>
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
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input 
                      placeholder="Enter your email" 
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      disabled={subscribing}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="w-full"
                      disabled={subscribing}
                    >
                      {subscribing ? "Subscribing..." : "Subscribe for Updates"}
                    </Button>
                  </form>
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