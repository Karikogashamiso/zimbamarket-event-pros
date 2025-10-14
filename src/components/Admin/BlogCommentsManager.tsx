import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BlogComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  blog_posts: {
    title: string;
  };
}

export const BlogCommentsManager = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          blog_posts(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment approved successfully',
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment rejected',
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Blog Comments</h2>
      
      {comments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{comment.author_name}</span>
                  <Badge variant={comment.is_approved ? 'default' : 'secondary'}>
                    {comment.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    On: {comment.blog_posts.title}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {comment.author_email} • {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-foreground">{comment.content}</p>
                </div>
                
                <div className="flex gap-2">
                  {!comment.is_approved && (
                    <Button
                      onClick={() => handleApprove(comment.id)}
                      size="sm"
                      variant="default"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {comment.is_approved && (
                    <Button
                      onClick={() => handleReject(comment.id)}
                      size="sm"
                      variant="outline"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  <Button
                    onClick={() => setDeleteId(comment.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
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
