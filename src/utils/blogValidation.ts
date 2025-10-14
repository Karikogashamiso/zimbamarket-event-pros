import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must be less than 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string()
    .min(50, "Excerpt must be at least 50 characters")
    .max(500, "Excerpt must be less than 500 characters"),
  content: z.string()
    .min(100, "Content must be at least 100 characters"),
  author_name: z.string()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name must be less than 100 characters"),
  category: z.string()
    .min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  featured_image: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  read_time: z.number()
    .min(1, "Read time must be at least 1 minute")
    .optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const commentSchema = z.object({
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

export type BlogFormData = z.infer<typeof blogFormSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;