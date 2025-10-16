import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MetaTags from "@/components/SEO/MetaTags";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Clock, Tag, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { z } from "zod";

const commentSchema = z.object({
  author_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  author_email: z.string().email("Invalid email").optional().or(z.literal("")),
  content: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

const VideoTutorialDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentForm, setCommentForm] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVideo();
  }, [id]);

  useEffect(() => {
    if (video?.id) {
      fetchComments();
      fetchLikes();
    }
  }, [video?.id, user]);

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from("video_tutorials")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      setVideo(data);
    } catch (error) {
      console.error("Error fetching video:", error);
      toast({
        title: "Error",
        description: "Failed to load video tutorial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    
    setComments(data || []);
  };

  const fetchLikes = async () => {
    if (!id) return;
    const { count } = await supabase
      .from("video_likes")
      .select("*", { count: "exact", head: true })
      .eq("video_id", id);
    
    setLikes(count || 0);

    if (user) {
      const { data } = await supabase
        .from("video_likes")
        .select("id")
        .eq("video_id", id)
        .eq("user_id", user.id)
        .single();
      
      setIsLiked(!!data);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like videos",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("video_likes")
          .delete()
          .eq("video_id", id)
          .eq("user_id", user.id);
        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        await supabase
          .from("video_likes")
          .insert({ video_id: id, user_id: user.id });
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this video tutorial: ${video.title}`;

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: video.title,
            text: shareText,
            url: shareUrl,
          });
          toast({
            title: "Shared successfully",
            description: "Thanks for sharing!",
          });
          
          await supabase.from("booking_analytics").insert({
            service_id: video.id,
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
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
      
      await supabase.from("booking_analytics").insert({
        service_id: video.id,
        event_type: "share",
        event_data: { method: "clipboard" },
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    try {
      commentSchema.parse(commentForm);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from("video_comments")
        .insert({
          video_id: id,
          user_id: user?.id,
          ...commentForm,
        });

      if (error) throw error;

      toast({
        title: "Comment submitted",
        description: "Your comment is pending approval",
      });
      setCommentForm({ author_name: "", author_email: "", content: "" });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = '';
        if (url.includes("youtu.be")) {
          videoId = url.split("/").pop()?.split("?")[0] || '';
        } else if (url.includes("youtube.com")) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get("v") || '';
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      
      if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop()?.split("?")[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
      }
      
      return url;
    } catch (error) {
      console.error("Error parsing video URL:", error);
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video not found</h1>
          <Link to="/video-tutorials">
            <Button>Back to Videos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title={video.title}
        description={video.description}
        image={video.thumbnail_url}
      />
      <Header variant="solid" />
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Link to="/video-tutorials">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Videos
            </Button>
          </Link>

          <div className="aspect-video mb-8 rounded-lg overflow-hidden">
            <iframe
              src={getVideoEmbedUrl(video.video_url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <h1 className="text-4xl font-bold mb-4">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="secondary">{video.category}</Badge>
            <Badge variant="outline">{video.difficulty_level}</Badge>
            {video.duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{video.duration} min</span>
              </div>
            )}
          </div>

          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {video.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          <p className="text-lg text-muted-foreground mb-8">{video.description}</p>

          <div className="flex items-center gap-4 mb-12">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              {likes}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              {comments.length}
            </div>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Leave a Comment</h2>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your Name *"
                  value={commentForm.author_name}
                  onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                  className={errors.author_name ? "border-destructive" : ""}
                />
                {errors.author_name && (
                  <p className="text-sm text-destructive mt-1">{errors.author_name}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email (optional)"
                  value={commentForm.author_email}
                  onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                  className={errors.author_email ? "border-destructive" : ""}
                />
                {errors.author_email && (
                  <p className="text-sm text-destructive mt-1">{errors.author_email}</p>
                )}
              </div>
              <div>
                <Textarea
                  placeholder="Your Comment *"
                  rows={4}
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className={errors.content ? "border-destructive" : ""}
                />
                {errors.content && (
                  <p className="text-sm text-destructive mt-1">{errors.content}</p>
                )}
              </div>
              <Button type="submit" disabled={submittingComment}>
                {submittingComment ? "Submitting..." : "Submit Comment"}
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.author_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VideoTutorialDetail;