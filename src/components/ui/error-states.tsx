import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Search, Database, Server, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Generic Error State Component
interface ErrorStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]}`}>
      <div className={`mx-auto ${iconSizes[size]} ${
        variant === 'destructive' ? 'text-destructive' :
        variant === 'warning' ? 'text-yellow-500' :
        'text-muted-foreground'
      } mb-4`}>
        {icon || <AlertTriangle />}
      </div>
      
      <h3 className={`font-semibold mb-2 ${
        size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'
      }`}>
        {title}
      </h3>
      
      <p className={`text-muted-foreground mb-6 max-w-md ${
        size === 'lg' ? 'text-lg' : 'text-sm'
      }`}>
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Network Error Component
interface NetworkErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry, isRetrying }) => (
  <ErrorState
    icon={<WifiOff className="w-12 h-12" />}
    title="Connection Problem"
    description="Unable to connect to our servers. Please check your internet connection and try again."
    variant="warning"
    action={onRetry ? {
      label: isRetrying ? "Retrying..." : "Try Again",
      onClick: onRetry
    } : undefined}
  />
);

// Data Loading Error Component
interface DataErrorProps {
  type?: 'services' | 'categories' | 'reviews' | 'user' | 'search';
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const DataError: React.FC<DataErrorProps> = ({ type = 'data', onRetry, isRetrying }) => {
  const getErrorContent = () => {
    switch (type) {
      case 'services':
        return {
          title: "Unable to Load Services",
          description: "We're having trouble loading the services right now. This could be due to a temporary connection issue.",
          icon: <Database className="w-12 h-12" />
        };
      case 'categories':
        return {
          title: "Categories Unavailable",
          description: "We can't load the service categories at the moment. Please try again in a few seconds.",
          icon: <Server className="w-12 h-12" />
        };
      case 'reviews':
        return {
          title: "Reviews Not Loading",
          description: "Customer reviews are temporarily unavailable. You can still view service details and make bookings.",
          icon: <AlertCircle className="w-12 h-12" />
        };
      case 'user':
        return {
          title: "Profile Error",
          description: "We're having trouble loading your profile information. Please try signing out and back in.",
          icon: <AlertTriangle className="w-12 h-12" />
        };
      case 'search':
        return {
          title: "Search Temporarily Unavailable",
          description: "Our search service is experiencing issues. You can browse categories or try again in a moment.",
          icon: <Search className="w-12 h-12" />
        };
      default:
        return {
          title: "Something Went Wrong",
          description: "We encountered an unexpected error. Our team has been notified and we're working to fix it.",
          icon: <AlertTriangle className="w-12 h-12" />
        };
    }
  };

  const { title, description, icon } = getErrorContent();

  return (
    <ErrorState
      icon={icon}
      title={title}
      description={description}
      variant="default"
      action={onRetry ? {
        label: isRetrying ? "Retrying..." : "Try Again",
        onClick: onRetry
      } : undefined}
    />
  );
};

// Form Error Component
interface FormErrorProps {
  title?: string;
  errors: Record<string, string>;
  onClear?: () => void;
}

export const FormError: React.FC<FormErrorProps> = ({ 
  title = "Please fix the following issues", 
  errors, 
  onClear 
}) => (
  <Alert variant="destructive" className="mb-4">
    <XCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside space-y-1 mt-2">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field} className="text-sm">{error}</li>
        ))}
      </ul>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear} className="mt-3">
          Clear Errors
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

// Timeout Error Component
interface TimeoutErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const TimeoutError: React.FC<TimeoutErrorProps> = ({ onRetry, isRetrying }) => (
  <ErrorState
    icon={<Clock className="w-12 h-12" />}
    title="Request Timed Out"
    description="The request took too long to complete. This might be due to slow internet or high server load."
    variant="warning"
    action={onRetry ? {
      label: isRetrying ? "Retrying..." : "Try Again",
      onClick: onRetry
    } : undefined}
  />
);

// Search No Results Component
interface SearchNoResultsProps {
  query?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  onClearFilters?: () => void;
}

export const SearchNoResults: React.FC<SearchNoResultsProps> = ({
  query,
  suggestions = [],
  onSuggestionClick,
  onClearFilters
}) => (
  <div className="text-center py-12">
    <Search className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
    <h3 className="text-2xl font-semibold mb-4">No Results Found</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      {query 
        ? `We couldn't find any services matching "${query}". Try adjusting your search or browse our categories.`
        : "No services match your current filters. Try expanding your search criteria."
      }
    </p>
    
    <div className="space-y-4">
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      )}
      
      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-primary hover:bg-primary/10"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Service Unavailable Component
interface ServiceUnavailableProps {
  serviceName?: string;
  reason?: 'maintenance' | 'offline' | 'removed' | 'suspended';
  onGoBack?: () => void;
}

export const ServiceUnavailable: React.FC<ServiceUnavailableProps> = ({
  serviceName,
  reason = 'offline',
  onGoBack
}) => {
  const getReasonText = () => {
    switch (reason) {
      case 'maintenance':
        return "This service is temporarily unavailable due to scheduled maintenance.";
      case 'removed':
        return "This service is no longer available and may have been removed by the provider.";
      case 'suspended':
        return "This service has been temporarily suspended. Please contact support for more information.";
      default:
        return "This service is currently unavailable. Please try again later.";
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <Server className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Service Unavailable</h3>
        {serviceName && (
          <p className="font-medium mb-2">{serviceName}</p>
        )}
        <p className="text-muted-foreground text-sm mb-6">
          {getReasonText()}
        </p>
        {onGoBack && (
          <Button onClick={onGoBack} variant="outline">
            Go Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Inline Field Error Component
interface FieldErrorProps {
  error: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => (
  <p className={`text-xs text-destructive mt-1 flex items-center gap-1 ${className}`}>
    <AlertCircle className="w-3 h-3" />
    {error}
  </p>
);

// Loading Error Banner Component
interface LoadingErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const LoadingErrorBanner: React.FC<LoadingErrorBannerProps> = ({
  message = "Some content failed to load",
  onRetry,
  onDismiss
}) => (
  <Alert variant="destructive" className="mb-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Loading Error</AlertTitle>
    <AlertDescription className="flex items-center justify-between">
      <span>{message}</span>
      <div className="flex gap-2 ml-4">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </div>
    </AlertDescription>
  </Alert>
);