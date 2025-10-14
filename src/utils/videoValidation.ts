import { z } from 'zod';

export const videoFormSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .min(50, "Description must be at least 50 characters")
    .max(1000, "Description must be less than 1000 characters"),
  video_url: z.string()
    .url("Must be a valid YouTube or video URL")
    .refine(
      (url) => url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'),
      "Must be a YouTube or Vimeo URL"
    ),
  thumbnail_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  category: z.string()
    .min(1, "Category is required"),
  difficulty_level: z.string()
    .min(1, "Difficulty level is required"),
  duration: z.string()
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const videoCommentSchema = z.object({
  author_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  author_email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  content: z.string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be less than 1000 characters"),
});

export type VideoFormData = z.infer<typeof videoFormSchema>;
export type VideoCommentFormData = z.infer<typeof videoCommentSchema>;