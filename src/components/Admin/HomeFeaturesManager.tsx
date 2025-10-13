import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface HomeFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: { text: string }[];
  is_active: boolean;
  display_order: number;
}

export const HomeFeaturesManager = () => {
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFeature, setEditingFeature] = useState<HomeFeature | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    features: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('home_features')
        .select('*')
        .order('display_order');

      if (error) throw error;
      const typedData = data?.map(item => ({
        ...item,
        features: item.features as { text: string }[]
      })) || [];
      setFeatures(typedData);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: 'Error',
        description: 'Failed to load features',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featuresArray = formData.features
      .split('\n')
      .filter(f => f.trim())
      .map(text => ({ text: text.trim() }));

    const featureData = {
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      features: featuresArray,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    try {
      if (editingFeature) {
        const { error } = await supabase
          .from('home_features')
          .update(featureData)
          .eq('id', editingFeature.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Feature updated successfully' });
      } else {
        const { error } = await supabase
          .from('home_features')
          .insert([featureData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Feature created successfully' });
      }

      fetchFeatures();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving feature:', error);
      toast({
        title: 'Error',
        description: 'Failed to save feature',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const { error } = await supabase
        .from('home_features')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Feature deleted successfully' });
      fetchFeatures();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feature',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (feature: HomeFeature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      features: feature.features.map(f => f.text).join('\n'),
      is_active: feature.is_active,
      display_order: feature.display_order,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFeature(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      features: '',
      is_active: true,
      display_order: 0,
    });
  };

  if (loading) return <div>Loading features...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Home Features</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add New Feature'}</DialogTitle>
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon Name (Lucide)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., Zap, Shield, Smartphone"
                  required
                />
              </div>
              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="One feature per line"
                  rows={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Show on website</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingFeature ? 'Update Feature' : 'Create Feature'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span>{feature.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${feature.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {feature.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-1">{feature.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(feature)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(feature.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Icon: {feature.icon}</p>
                <p className="text-sm font-semibold">Features:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {feature.features.map((f, idx) => (
                    <li key={idx}>{f.text}</li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">Display Order: {feature.display_order}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
