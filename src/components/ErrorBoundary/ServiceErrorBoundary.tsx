import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ServiceErrorBoundaryProps {
  children: React.ReactNode;
  serviceId?: string;
}

// Specialized error boundary for service-related components
const ServiceErrorBoundary: React.FC<ServiceErrorBoundaryProps> = ({
  children,
  serviceId
}) => {
  const fallbackUI = (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Service Unavailable
            </h3>
            <p className="text-muted-foreground">
              {serviceId 
                ? "We're having trouble loading this service. It may have been removed or is temporarily unavailable."
                : "We're having trouble loading service information right now."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/search">
              <Button className="gap-2">
                <Search className="w-4 h-4" />
                Browse Services
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallbackUI}
      onError={(error, errorInfo) => {
        console.error(`Error in service ${serviceId}:`, error, errorInfo);
        
        // Track service errors for analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'service_error', {
            service_id: serviceId,
            error_message: error.message,
            custom_parameter: 'service_boundary'
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ServiceErrorBoundary;