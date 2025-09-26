import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationError('');
    
    // Comprehensive email validation
    if (!email.trim()) {
      setValidationError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid email address (e.g., you@example.com)");
      return;
    }

    if (email.length > 255) {
      setValidationError("Email address is too long");
      return;
    }

    setIsSubscribing(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email.toLowerCase().trim(),
          source: 'footer',
          metadata: {
            subscribed_from: window.location.origin,
            user_agent: navigator.userAgent,
          }
        });

      if (error) {
        console.error('Newsletter subscription error:', error);
        
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter. Thank you for your interest!",
            variant: "default",
          });
        } else if (error.message.includes('violates row-level security')) {
          throw new Error('Permission denied. Please try again or contact support.');
        } else if (error.message.includes('connection')) {
          throw new Error('Connection failed. Please check your internet connection and try again.');
        } else {
          throw new Error('Subscription failed. Please try again or contact support if the problem persists.');
        }
        return;
      }

      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing! You'll receive event tips, exclusive offers, and the latest updates.",
      });

      setEmail(""); // Clear the form
      setValidationError('');
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      toast({
        title: "Subscription failed",
        description: error.message || "Unable to subscribe right now. Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <div className="flex-1">
        <input 
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="Enter your email"
          disabled={isSubscribing}
          className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder:text-white/60 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            validationError 
              ? 'border-red-400 focus:ring-red-400/50' 
              : 'border-white/20 focus:ring-secondary'
          }`}
        />
        {validationError && (
          <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
            ⚠️ {validationError}
          </p>
        )}
      </div>
      <Button 
        type="submit" 
        variant="secondary" 
        className="px-6 py-3 font-semibold disabled:opacity-50 min-w-[120px]"
        disabled={isSubscribing || !!validationError}
      >
        {isSubscribing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subscribing...
          </>
        ) : (
          'Subscribe'
        )}
      </Button>
    </form>
  );
};

export default NewsletterSubscription;