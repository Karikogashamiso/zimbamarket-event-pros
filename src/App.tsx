import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";
import ChatWidget from "./components/Chat/ChatWidget";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import SearchResults from "./pages/SearchResults";
import ServiceDetail from "./pages/ServiceDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import VideoTutorials from "./pages/VideoTutorials";
import ListBusiness from "./pages/ListBusiness";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import TicketDesign from "./pages/TicketDesign";
import { CheckoutFlow } from "./components/Checkout/CheckoutFlow";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import Events from "./pages/Events";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ServiceProviderDashboard from "./pages/ServiceProviderDashboard";
import AdminLayout from "./pages/Admin/Layout";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminOrganizers from "./pages/Admin/Organizers";
import AdminVenues from "./pages/Admin/Venues";
import AdminEvents from "./pages/Admin/Events";
import AdminServices from "./pages/Admin/Services";
import AdminOrders from "./pages/Admin/Orders";
import LaunchPlan from "./pages/LaunchPlan";
import UXOptimizationGuide from "./pages/UXOptimizationGuide";
import Auth from "./pages/Auth";
import MyBusinessApplications from "./pages/MyBusinessApplications";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary 
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('Top-level application error:', error, errorInfo);
        
        // Send critical errors to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: `App Error: ${error.message}`,
            fatal: true,
            custom_parameter: 'app_boundary'
          });
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <TooltipProvider delayDuration={0} skipDelayDuration={0}>
              <div>
                <Toaster />
                <Sonner />
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/categories" element={<Layout><Categories /></Layout>} />
                  <Route path="/search" element={<Layout><SearchResults /></Layout>} />
                  <Route path="/service/:id" element={<Layout><ServiceDetail /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
                  <Route path="/blog" element={<Layout><Blog /></Layout>} />
                  <Route path="/video-tutorials" element={<Layout><VideoTutorials /></Layout>} />
                  <Route path="/list-business" element={<Layout><ListBusiness /></Layout>} />
                  <Route path="/my-applications" element={<Layout><MyBusinessApplications /></Layout>} />
                  <Route path="/help" element={<Layout><Help /></Layout>} />
                  <Route path="/contact" element={<Layout><Contact /></Layout>} />
                  <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
                  <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
                  <Route path="/tickets" element={<Layout><TicketDesign /></Layout>} />
                  <Route path="/events" element={<Layout><Events /></Layout>} />
                  <Route path="/organizer" element={<Layout><OrganizerDashboard /></Layout>} />
                  <Route path="/organizer/dashboard" element={<Layout><OrganizerDashboard /></Layout>} />
                  <Route path="/service-provider" element={<Layout><ServiceProviderDashboard /></Layout>} />
                  <Route path="/service-provider/dashboard" element={<Layout><ServiceProviderDashboard /></Layout>} />
                  
                  {/* Admin Routes with nested structure */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="organizers" element={<AdminOrganizers />} />
                    <Route path="venues" element={<AdminVenues />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="orders" element={<AdminOrders />} />
                  </Route>
                  
                  <Route path="/checkout" element={<Layout><CheckoutFlow /></Layout>} />
                  <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                  <Route path="/launch-plan" element={<Layout><LaunchPlan /></Layout>} />
                  <Route path="/ux-guide" element={<Layout><UXOptimizationGuide /></Layout>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
                
                {/* Global Chat Widget - Available on all pages */}
                <ChatWidget />
              </div>
            </TooltipProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
