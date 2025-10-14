import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  read_time: number;
  views: number;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export const BlogPostsManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author_name: '',
    author_avatar: '',
    category: 'Events',
    tags: '',
    read_time: 5,
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const postData = {
        ...formData,
        slug,
        tags,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast.success('Blog post created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(error.message || 'Failed to save blog post');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deletePostId);

      if (error) throw error;
      toast.success('Blog post deleted');
      setDeletePostId(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image || '',
      author_name: post.author_name,
      author_avatar: post.author_avatar || '',
      category: post.category,
      tags: post.tags.join(', '),
      read_time: post.read_time,
      is_featured: post.is_featured,
      is_published: post.is_published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      author_name: '',
      author_avatar: '',
      category: 'Events',
      tags: '',
      read_time: 5,
      is_featured: false,
      is_published: false,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Posts Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="event, tips, guide"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="read_time">Read Time (minutes)</Label>
                  <Input
                    id="read_time"
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  {post.is_featured && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Featured</span>
                  )}
                  {post.is_published ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.read_time} min read</span>
                  <span>•</span>
                  <span>{post.views} views</span>
                  <span>•</span>
                  <span>by {post.author_name}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeletePostId(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
