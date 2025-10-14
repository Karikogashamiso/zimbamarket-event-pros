-- Create comments and likes tables for blogs and videos

-- Blog comments table
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Blog likes table
CREATE TABLE public.blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blog_post_id, user_id)
);

-- Video tutorial comments table
CREATE TABLE public.video_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.video_tutorials(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Video tutorial likes table
CREATE TABLE public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.video_tutorials(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_comments
CREATE POLICY "Anyone can view approved blog comments"
  ON public.blog_comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all blog comments"
  ON public.blog_comments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create blog comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all blog comments"
  ON public.blog_comments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for blog_likes
CREATE POLICY "Anyone can view blog likes"
  ON public.blog_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like blogs"
  ON public.blog_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own blog likes"
  ON public.blog_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for video_comments
CREATE POLICY "Anyone can view approved video comments"
  ON public.video_comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all video comments"
  ON public.video_comments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create video comments"
  ON public.video_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all video comments"
  ON public.video_comments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for video_likes
CREATE POLICY "Anyone can view video likes"
  ON public.video_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like videos"
  ON public.video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own video likes"
  ON public.video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_comments_updated_at
  BEFORE UPDATE ON public.video_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(blog_post_id);
CREATE INDEX idx_blog_likes_post_id ON public.blog_likes(blog_post_id);
CREATE INDEX idx_video_comments_video_id ON public.video_comments(video_id);
CREATE INDEX idx_video_likes_video_id ON public.video_likes(video_id);