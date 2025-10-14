-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Create RLS policies for blog images bucket
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create video_tutorials table
CREATE TABLE public.video_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on video_tutorials
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_tutorials
CREATE POLICY "Anyone can view published video tutorials"
ON public.video_tutorials FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all video tutorials"
ON public.video_tutorials FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for video_tutorials
CREATE TRIGGER update_video_tutorials_updated_at
BEFORE UPDATE ON public.video_tutorials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();