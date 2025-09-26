import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  reviewerName: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
});

interface ReviewModalProps {
  serviceId: string;
  serviceName: string;
  onReviewSubmitted?: () => void;
}

export const ReviewModal = ({ serviceId, serviceName, onReviewSubmitted }: ReviewModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const validateForm = () => {
    try {
      reviewSchema.parse({
        rating,
        reviewerName: reviewerName.trim(),
        comment: comment.trim() || undefined,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        service_id: serviceId,
        rating,
        reviewer_name: reviewerName.trim(),
        comment: comment.trim() || null,
      };

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review has been published.",
      });

      // Reset form
      setRating(0);
      setReviewerName("");
      setComment("");
      setErrors({});
      setIsOpen(false);
      
      // Notify parent component
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageSquare className="w-4 h-4 mr-2" />
          Write Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review for {serviceName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="transition-colors"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Name *</label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className={errors.reviewerName ? 'border-destructive' : ''}
            />
            {errors.reviewerName && (
              <p className="text-sm text-destructive mt-1">{errors.reviewerName}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Review</label>
            <Textarea
              placeholder="Share your experience with this service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className={errors.comment ? 'border-destructive' : ''}
            />
            {errors.comment && (
              <p className="text-sm text-destructive mt-1">{errors.comment}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};