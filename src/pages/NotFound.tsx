import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, MapPin, Clock, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Track 404 errors in analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_not_found', {
        page_path: location.pathname,
        custom_parameter: '404_error'
      });
    }
  }, [location.pathname]);

  const isServiceRoute = location.pathname.startsWith('/service/');
  const isCategoryRoute = location.pathname.startsWith('/categories/');
  
  const getErrorContext = () => {
    if (isServiceRoute) {
      return {
        title: "Service Not Found",
        description: "The service you're looking for doesn't exist or may have been removed.",
        icon: <MapPin className="w-16 h-16 text-muted-foreground" />
      };
    }
    if (isCategoryRoute) {
      return {
        title: "Category Not Found", 
        description: "The category you're looking for doesn't exist or may have been moved.",
        icon: <Search className="w-16 h-16 text-muted-foreground" />
      };
    }
    return {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or may have been moved.",
      icon: <AlertTriangle className="w-16 h-16 text-muted-foreground" />
    };
  };

  const { title, description, icon } = getErrorContext();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | ZimEventPro</title>
        <meta name="description" content="The page you're looking for could not be found. Return to our homepage or browse our services." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="p-12">
            {/* Error Icon */}
            <div className="mb-8">
              {icon}
            </div>
            
            {/* 404 Display */}
            <div className="mb-6">
              <h1 className="text-8xl font-bold text-primary/20 mb-4 font-display">404</h1>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {description}
              </p>
            </div>

            {/* Navigation Options */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild>
                  <Link to="/search">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Services
                  </Link>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Looking for something specific?
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link 
                  to="/categories" 
                  className="text-primary hover:underline"
                >
                  View Categories
                </Link>
                <Link 
                  to="/about" 
                  className="text-primary hover:underline"
                >
                  About Us
                </Link>
                <Link 
                  to="/contact" 
                  className="text-primary hover:underline"
                >
                  Contact Support
                </Link>
                <Link 
                  to="/help" 
                  className="text-primary hover:underline"
                >
                  Get Help
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotFound;
