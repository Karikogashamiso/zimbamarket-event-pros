import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, TrendingUp, Star, MapPin, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LazyImage from '@/components/LazyImage';
import { trackSearch } from '@/components/Analytics/GoogleAnalytics';

interface AISearchProps {
  onResults?: (results: any) => void;
  className?: string;
}

const AISearch: React.FC<AISearchProps> = ({ onResults, className }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<unknown>(null);

  const handleAISearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      // Track the search
      trackSearch(query, location);

      // Call AI search edge function
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: {
          query: query,
          location: location,
          userPreferences: {
            // You could get these from user's stored preferences
            preferredCategories: [],
            budget: { min: 0, max: 10000 }
          }
        }
      });

      if (error) {
        console.error('AI Search error:', error);
        // Fall back to regular search if AI fails
        handleFallbackSearch();
        return;
      }

      setResults(data);
      onResults?.(data);

    } catch (error) {
      console.error('Search failed:', error);
      handleFallbackSearch();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackSearch = async () => {
    // Fallback to regular database search
    try {
      let searchQuery = supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          location,
          price_from,
          rating,
          category:categories(name, slug),
          image_url
        `)
        .eq('active', true);

      if (query) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (location) {
        searchQuery = searchQuery.ilike('location', `%${location}%`);
      }

      const { data: services, error } = await searchQuery.limit(20);

      if (!error && services) {
        const fallbackResults = {
          success: true,
          aiAnalysis: {
            interpretedIntent: `Search for "${query}" ${location ? `in ${location}` : ''}`,
            extractedRequirements: {
              eventType: 'general',
              locationPreference: location
            },
            recommendedServices: services.map(s => ({
              serviceId: s.id,
              relevanceScore: 0.8,
              reasonForRecommendation: 'Matches your search terms'
            }))
          },
          recommendedServices: services,
          totalResults: services.length
        };

        setResults(fallbackResults);
        onResults?.(fallbackResults);
      }
    } catch (error) {
      console.error('Fallback search failed:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAISearch();
    }
  };

  return (
    <div className={className}>
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            AI-Powered Search
          </CardTitle>
          <p className="text-muted-foreground">
            Describe what you're looking for in natural language
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: 'I need a wedding venue for 150 guests in Harare under $3000'"
                className="pl-12 h-12 text-base"
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="pl-12 h-12"
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleAISearch}
              disabled={isLoading || !query.trim()}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI is thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Search with AI
                </>
              )}
            </Button>

            {/* Suggested Searches */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Birthday party venue for kids in Bulawayo",
                  "Professional wedding photographer under $1000",
                  "Corporate event catering for 200 people",
                  "DJ for graduation party this weekend"
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Results */}
          {results && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Understanding
                </h3>
                <p className="text-sm text-muted-foreground">
                  {results.aiAnalysis?.interpretedIntent}
                </p>
                
                {results.aiAnalysis?.extractedRequirements && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.aiAnalysis.extractedRequirements.eventType && (
                      <Badge variant="outline">
                        {results.aiAnalysis.extractedRequirements.eventType}
                      </Badge>
                    )}
                    {results.aiAnalysis.extractedRequirements.estimatedBudget && (
                      <Badge variant="outline">
                        Budget: {results.aiAnalysis.extractedRequirements.estimatedBudget}
                      </Badge>
                    )}
                    {results.aiAnalysis.extractedRequirements.guestCount && (
                      <Badge variant="outline">
                        {results.aiAnalysis.extractedRequirements.guestCount} guests
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Results Preview */}
              {results.recommendedServices && results.recommendedServices.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top Recommendations ({results.totalResults} found)
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {results.recommendedServices.slice(0, 6).map((service: any) => (
                      <Card key={service.id} className="group hover:shadow-lg transition-all duration-300">
                        <div className="relative overflow-hidden">
                          <LazyImage
                            src={service.image_url || "/placeholder.svg"}
                            alt={service.title}
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                            placeholder="/placeholder.svg"
                          />
                          <div className="absolute top-1 right-1">
                            <div className="flex items-center gap-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                              <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                              {service.rating?.toFixed(1) || '4.5'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <h4 className="font-medium text-xs mb-1 line-clamp-2">
                            {service.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate">{service.location}</span>
                            {service.price_from && (
                              <span className="font-semibold text-primary">
                                ${service.price_from}
                              </span>
                            )}
                          </div>
                          {service.recommendationReason && (
                            <p className="text-xs text-green-600 mt-1 line-clamp-1">
                              {service.recommendationReason}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      View All Results & Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AISearch;