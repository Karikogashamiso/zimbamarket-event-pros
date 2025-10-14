import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MetaTags from "@/components/SEO/MetaTags";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Calendar, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { z } from "zod";

const commentSchema = z.object({
  author_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  author_email: z.string().email("Invalid email").optional().or(z.literal("")),
  content: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

const BlogDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
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
    fetchBlogPost();
    fetchComments();
    fetchLikes();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      setPost(data);

      // Update view count
      await supabase
        .from("blog_posts")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", data.id);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post?.id) return;
    const { data } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("blog_post_id", post.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    
    setComments(data || []);
  };

  const fetchLikes = async () => {
    if (!post?.id) return;
    const { count } = await supabase
      .from("blog_likes")
      .select("*", { count: "exact", head: true })
      .eq("blog_post_id", post.id);
    
    setLikes(count || 0);

    if (user) {
      const { data } = await supabase
        .from("blog_likes")
        .select("id")
        .eq("blog_post_id", post.id)
        .eq("user_id", user.id)
        .single();
      
      setIsLiked(!!data);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like posts",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("blog_likes")
          .delete()
          .eq("blog_post_id", post.id)
          .eq("user_id", user.id);
        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        await supabase
          .from("blog_likes")
          .insert({ blog_post_id: post.id, user_id: user.id });
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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
        .from("blog_comments")
        .insert({
          blog_post_id: post.id,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title={post.title}
        description={post.excerpt}
        image={post.featured_image}
      />
      
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-[400px] object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.published_at || post.created_at), "MMM dd, yyyy")}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="flex items-center gap-4 mb-12">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              {likes}
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
    </>
  );
};

export default BlogDetail;