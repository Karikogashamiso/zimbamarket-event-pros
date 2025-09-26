import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName?: string;
  className?: string;
  showRetry?: boolean;
}

// Lightweight error boundary for individual sections
const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({
  children,
  sectionName = "section",
  className = "",
  showRetry = true
}) => {
  const fallbackUI = (
    <div className={`py-8 ${className}`}>
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">
              Unable to load {sectionName}
            </h4>
            <p className="text-sm text-muted-foreground">
              This section is temporarily unavailable. Please try refreshing the page.
            </p>
          </div>

          {showRetry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallbackUI}
      onError={(error, errorInfo) => {
        console.error(`Error in ${sectionName}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SectionErrorBoundary;