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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  category: string;
  difficulty_level: string;
  tags: string[];
  view_count: number;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export const VideoTutorialsManager = () => {
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTutorial, setEditingTutorial] = useState<VideoTutorial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTutorialId, setDeleteTutorialId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    category: 'basics',
    difficulty_level: 'beginner',
    tags: '',
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('video_tutorials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      toast.error('Failed to load video tutorials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const tutorialData = {
        ...formData,
        tags,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingTutorial) {
        const { error } = await supabase
          .from('video_tutorials')
          .update(tutorialData)
          .eq('id', editingTutorial.id);

        if (error) throw error;
        toast.success('Video tutorial updated successfully');
      } else {
        const { error } = await supabase
          .from('video_tutorials')
          .insert([tutorialData]);

        if (error) throw error;
        toast.success('Video tutorial created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTutorials();
    } catch (error: any) {
      console.error('Error saving tutorial:', error);
      toast.error(error.message || 'Failed to save video tutorial');
    }
  };

  const handleDelete = async () => {
    if (!deleteTutorialId) return;

    try {
      const { error } = await supabase
        .from('video_tutorials')
        .delete()
        .eq('id', deleteTutorialId);

      if (error) throw error;
      toast.success('Video tutorial deleted');
      setDeleteTutorialId(null);
      fetchTutorials();
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      toast.error('Failed to delete tutorial');
    }
  };

  const handleEdit = (tutorial: VideoTutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title,
      description: tutorial.description,
      video_url: tutorial.video_url,
      thumbnail_url: tutorial.thumbnail_url || '',
      duration: tutorial.duration || '',
      category: tutorial.category,
      difficulty_level: tutorial.difficulty_level,
      tags: tutorial.tags.join(', '),
      is_featured: tutorial.is_featured,
      is_published: tutorial.is_published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTutorial(null);
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      category: 'basics',
      difficulty_level: 'beginner',
      tags: '',
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
        <h2 className="text-2xl font-bold">Video Tutorials Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tutorial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTutorial ? 'Edit Tutorial' : 'Create New Tutorial'}</DialogTitle>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="video_url">Video URL (YouTube/Vimeo)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (e.g., 12:30)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding Planning</SelectItem>
                      <SelectItem value="corporate">Corporate Events</SelectItem>
                      <SelectItem value="basics">Event Basics</SelectItem>
                      <SelectItem value="vendor">For Vendors</SelectItem>
                      <SelectItem value="tips">Pro Tips</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="planning, budget, tips"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Tutorial</Label>
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
                  {editingTutorial ? 'Update' : 'Create'} Tutorial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{tutorial.title}</h3>
                  {tutorial.is_featured && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Featured</span>
                  )}
                  {tutorial.is_published ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{tutorial.category}</span>
                  <span>•</span>
                  <span>{tutorial.difficulty_level}</span>
                  {tutorial.duration && (
                    <>
                      <span>•</span>
                      <span>{tutorial.duration}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{tutorial.view_count} views</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(tutorial)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTutorialId(tutorial.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTutorialId} onOpenChange={(open) => !open && setDeleteTutorialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video Tutorial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video tutorial? This action cannot be undone.
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
