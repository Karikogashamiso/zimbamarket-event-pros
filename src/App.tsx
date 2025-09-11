import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import LaunchPlan from "./pages/LaunchPlan";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/video-tutorials" element={<VideoTutorials />} />
            <Route path="/list-business" element={<ListBusiness />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/tickets" element={<TicketDesign />} />
            <Route path="/checkout" element={<CheckoutFlow />} />
            <Route path="/launch-plan" element={<LaunchPlan />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
