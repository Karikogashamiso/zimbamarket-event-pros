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

interface HomeStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export const HomeStatsManager = () => {
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStat, setEditingStat] = useState<HomeStat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    label: '',
    value: '',
    description: '',
    icon: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('home_stats')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setStats((data || []) as HomeStat[]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStat) {
        const { error } = await supabase
          .from('home_stats')
          .update(formData)
          .eq('id', editingStat.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Stat updated successfully' });
      } else {
        const { error } = await supabase
          .from('home_stats')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Stat created successfully' });
      }

      fetchStats();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving stat:', error);
      toast({
        title: 'Error',
        description: 'Failed to save stat',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stat?')) return;

    try {
      const { error } = await supabase
        .from('home_stats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Stat deleted successfully' });
      fetchStats();
    } catch (error) {
      console.error('Error deleting stat:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete stat',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (stat: HomeStat) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      description: stat.description,
      icon: stat.icon,
      is_active: stat.is_active,
      display_order: stat.display_order,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStat(null);
    setFormData({
      label: '',
      value: '',
      description: '',
      icon: '',
      is_active: true,
      display_order: 0,
    });
  };

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Home Stats</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingStat ? 'Edit Stat' : 'Add New Stat'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Tickets Sold"
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., 50,000+"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Successfully processed across Zimbabwe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon Name (Lucide)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., Ticket, Users, Activity"
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
                {editingStat ? 'Update Stat' : 'Create Stat'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stat.label}</span>
                    <span className={`text-xs px-2 py-1 rounded ${stat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {stat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
                <p className="text-sm font-semibold">Icon: {stat.icon}</p>
                <p className="text-sm text-muted-foreground">Order: {stat.display_order}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(stat)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(stat.id)} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
