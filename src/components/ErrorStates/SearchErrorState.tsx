import React from 'react';
import { Search, RefreshCw, Filter, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface SearchErrorStateProps {
  query?: string;
  hasFilters?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isRetrying?: boolean;
  errorType?: 'network' | 'timeout' | 'server' | 'no-results';
}

const SearchErrorState: React.FC<SearchErrorStateProps> = ({
  query,
  hasFilters,
  onRetry,
  onClearFilters,
  isRetrying,
  errorType = 'server'
}) => {
  const getErrorContent = () => {
    switch (errorType) {
      case 'network':
        return {
          title: "Connection Lost",
          description: "Unable to perform search due to network issues. Please check your connection and try again.",
          suggestions: ["Check your internet connection", "Try refreshing the page", "Search again in a moment"]
        };
      
      case 'timeout':
        return {
          title: "Search Timed Out",
          description: "The search took too long to complete. This might be due to high server load or complex filters.",
          suggestions: ["Try simplifying your search", "Remove some filters", "Try again in a moment"]
        };
      
      case 'no-results':
        return {
          title: `No results found${query ? ` for "${query}"` : ''}`,
          description: hasFilters 
            ? "No services match your current search criteria. Try adjusting your filters or search terms."
            : "We couldn't find any services matching your search. Try different keywords or browse our categories.",
          suggestions: hasFilters 
            ? ["Remove some filters", "Try different keywords", "Browse all categories"]
            : ["Check spelling", "Use different keywords", "Browse categories instead"]
        };
      
      default:
        return {
          title: "Search Unavailable",
          description: "Our search service is temporarily experiencing issues. You can browse categories or try again shortly.",
          suggestions: ["Browse by category", "Try basic search", "Come back in a few minutes"]
        };
    }
  };

  const { title, description, suggestions } = getErrorContent();

  return (
    <div className="py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{description}</p>
          
          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium mb-4">Try these suggestions:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center justify-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                disabled={isRetrying}
                className="min-w-[120px]"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            
            {hasFilters && onClearFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            
            <Link to="/categories">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Browse Categories
              </Button>
            </Link>
          </div>
          
          {/* Popular searches for no-results state */}
          {errorType === 'no-results' && (
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm font-medium mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Wedding Venues', 'Corporate Events', 'Photography', 'Catering', 'DJ Services'].map((term) => (
                  <Button
                    key={term}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:bg-primary/10"
                    onClick={() => {
                      // This would trigger a new search
                      window.location.href = `/search?q=${encodeURIComponent(term)}`;
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchErrorState;