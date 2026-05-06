import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // UI component libraries
          "vendor-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          // Query and forms
          "vendor-query": ["@tanstack/react-query"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Date utilities
          "vendor-date": ["date-fns"],
          // PDF generation
          "vendor-pdf": ["jspdf"],
          // QR code
          "vendor-qr": ["qrcode"],
          // Recharts
          "vendor-charts": ["recharts"],
          // Admin pages bundle
          "pages-admin": [
            "./src/pages/Admin/Dashboard",
            "./src/pages/Admin/Categories",
            "./src/pages/Admin/Organizers",
            "./src/pages/Admin/Venues",
            "./src/pages/Admin/Events",
            "./src/pages/Admin/Services",
            "./src/pages/Admin/Orders",
            "./src/pages/Admin/Tickets",
            "./src/pages/Admin/Users",
            "./src/pages/Admin/Reports",
            "./src/pages/Admin/Contacts",
            "./src/pages/Admin/Testimonials",
            "./src/pages/Admin/HomeContent",
            "./src/pages/Admin/Newsletter",
            "./src/pages/Admin/BlogPosts",
            "./src/pages/Admin/BlogComments",
            "./src/pages/Admin/VideoTutorials",
            "./src/pages/Admin/VideoComments",
            "./src/pages/Admin/WebhookTesting",
          ],
          // Dashboard pages
          "pages-dashboard": [
            "./src/pages/OrganizerDashboard",
            "./src/pages/ServiceProviderDashboard",
            "./src/pages/CreateService",
            "./src/pages/BusinessListingDetail",
          ],
          // Checkout flow
          "pages-checkout": [
            "./src/pages/OrderConfirmation",
            "./src/pages/BookingPaymentSuccess",
            "./src/pages/ScanTicket",
            "./src/pages/TicketDetail",
          ],
        },
      },
    },
  },
}));
