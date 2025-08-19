import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Award, 
  Verified, 
  Star, 
  ThumbsUp, 
  Users, 
  Calendar,
  CheckCircle,
  TrendingUp,
  Heart,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
    totalReviews: number;
  };
  rating: number;
  title: string;
  content: string;
  date: Date;
  helpful: number;
  eventType: string;
  verified: boolean;
  photos?: string[];
}

interface BusinessCredentials {
  businessLicense: boolean;
  insurance: boolean;
  taxCompliance: boolean;
  professionalCertifications: string[];
  yearsInBusiness: number;
  totalEvents: number;
  verificationDate: Date;
}

interface SocialProofProps {
  serviceId: string;
  businessCredentials?: BusinessCredentials;
  reviews?: Review[];
  className?: string;
}

const SocialProof: React.FC<SocialProofProps> = ({
  serviceId,
  businessCredentials,
  reviews = [],
  className
}) => {
  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    const mockReviews: Review[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Mukamuri',
          avatar: '/api/placeholder/40/40',
          verified: true,
          totalReviews: 23
        },
        rating: 5,
        title: 'Perfect Wedding Venue!',
        content: 'The venue exceeded all our expectations. The staff was incredibly professional, the food was outstanding, and the ambiance was magical. Our wedding day was absolutely perfect thanks to their attention to detail.',
        date: new Date('2024-01-15'),
        helpful: 12,
        eventType: 'Wedding',
        verified: true,
        photos: ['/api/placeholder/200/150', '/api/placeholder/200/150']
      },
      {
        id: '2',
        author: {
          name: 'Michael Chiweshe',
          verified: true,
          totalReviews: 8
        },
        rating: 5,
        title: 'Excellent Corporate Event Service',
        content: 'Organized our company\'s annual conference here. The technical setup was flawless, catering was top-notch, and the team handled everything professionally. Highly recommend for corporate events.',
        date: new Date('2024-01-10'),
        helpful: 8,
        eventType: 'Corporate Event',
        verified: true
      },
      {
        id: '3',
        author: {
          name: 'Grace Moyo',
          verified: false,
          totalReviews: 3
        },
        rating: 4,
        title: 'Great Birthday Party Venue',
        content: 'Had my daughter\'s 16th birthday party here. The decorations were beautiful and the DJ kept everyone dancing. Only minor issue was parking, but overall a fantastic experience.',
        date: new Date('2024-01-05'),
        helpful: 5,
        eventType: 'Birthday Party',
        verified: false
      }
    ];

    setTimeout(() => {
      setDisplayReviews(mockReviews);
      setIsLoading(false);
    }, 1000);
  }, [serviceId]);

  const mockCredentials: BusinessCredentials = {
    businessLicense: true,
    insurance: true,
    taxCompliance: true,
    professionalCertifications: ['Event Planning Certificate', 'Food Safety Certificate'],
    yearsInBusiness: 8,
    totalEvents: 350,
    verificationDate: new Date('2024-01-01')
  };

  const credentials = businessCredentials || mockCredentials;

  // Calculate review statistics
  const totalReviews = displayReviews.length;
  const averageRating = totalReviews > 0 
    ? displayReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: displayReviews.filter(review => review.rating === rating).length,
    percentage: totalReviews > 0 
      ? (displayReviews.filter(review => review.rating === rating).length / totalReviews) * 100 
      : 0
  }));

  const verifiedReviewsCount = displayReviews.filter(review => review.verified).length;
  const verificationRate = totalReviews > 0 ? (verifiedReviewsCount / totalReviews) * 100 : 0;

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Business Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Business Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {credentials.businessLicense ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm">Business License</span>
              </div>
              
              <div className="flex items-center gap-2">
                {credentials.insurance ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm">Insurance Coverage</span>
              </div>
              
              <div className="flex items-center gap-2">
                {credentials.taxCompliance ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm">Tax Compliance</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{credentials.yearsInBusiness} Years in Business</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm">{credentials.totalEvents}+ Events Completed</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Verified className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Verified Business</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Professional Certifications</h4>
              <div className="space-y-1">
                {credentials.professionalCertifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rating Summary */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              {renderStars(Math.round(averageRating), 'lg')}
              <p className="text-sm text-muted-foreground mt-2">
                Based on {totalReviews} reviews
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Verified className="w-4 h-4 text-green-600" />
                  <span>{verificationRate.toFixed(0)}% verified reviews</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>95% recommend</span>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{item.rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Progress value={item.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Response Rate</span>
                </div>
                <span className="font-semibold">98%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Response Time</span>
                </div>
                <span className="font-semibold">&lt; 2hrs</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Repeat Customers</span>
                </div>
                <span className="font-semibold">67%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.author.avatar} />
                      <AvatarFallback>
                        {review.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.author.name}</span>
                        {review.author.verified && (
                          <Verified className="w-4 h-4 text-blue-600" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {review.eventType}
                        </Badge>
                        {review.verified && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-muted-foreground">
                          {review.date.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {review.content}
                      </p>
                      
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.photos.slice(0, 3).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt="Review photo"
                              className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          Helpful ({review.helpful})
                        </button>
                        <span>{review.author.totalReviews} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4">
                <Button variant="outline">
                  View All Reviews
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;