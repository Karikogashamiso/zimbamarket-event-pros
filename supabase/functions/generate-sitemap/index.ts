import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate sitemap XML
    const sitemap = await generateSitemap(supabase);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function generateSitemap(supabase: any): Promise<string> {
  const baseUrl = "https://zimeventpro.com";
  const currentDate = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/categories", priority: "0.9", changefreq: "weekly" },
    { url: "/about", priority: "0.8", changefreq: "monthly" },
    { url: "/contact", priority: "0.8", changefreq: "monthly" },
    { url: "/list-business", priority: "0.9", changefreq: "monthly" },
    { url: "/help", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy-policy", priority: "0.5", changefreq: "yearly" },
    { url: "/terms-of-service", priority: "0.5", changefreq: "yearly" },
  ];

  // Fetch dynamic content
  const [categoriesResult, servicesResult, businessesResult] = await Promise.all([
    supabase.from("categories").select("slug, updated_at"),
    supabase.from("services").select("id, updated_at").eq("active", true),
    supabase.from("business_listings").select("id, updated_at").eq("status", "approved"),
  ]);

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  // Add static pages
  staticPages.forEach((page) => {
    sitemapXml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Add category pages
  if (categoriesResult.data) {
    categoriesResult.data.forEach((category: any) => {
      const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : currentDate;
      sitemapXml += `
  <url>
    <loc>${baseUrl}/categories?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
  }

  // Add service detail pages
  if (servicesResult.data) {
    servicesResult.data.forEach((service: any) => {
      const lastmod = service.updated_at ? new Date(service.updated_at).toISOString().split('T')[0] : currentDate;
      sitemapXml += `
  <url>
    <loc>${baseUrl}/service/${service.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  }

  // Add business listing pages (if they have public pages)
  if (businessesResult.data) {
    businessesResult.data.forEach((business: any) => {
      const lastmod = business.updated_at ? new Date(business.updated_at).toISOString().split('T')[0] : currentDate;
      sitemapXml += `
  <url>
    <loc>${baseUrl}/business/${business.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });
  }

  // Add search result pages for popular searches
  const popularSearches = [
    "wedding venues",
    "birthday party venues",
    "catering services",
    "djs",
    "photographers",
    "event decorators"
  ];

  popularSearches.forEach((search) => {
    sitemapXml += `
  <url>
    <loc>${baseUrl}/search?q=${encodeURIComponent(search)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // Add location-based pages
  const popularLocations = [
    "harare",
    "bulawayo",
    "chitungwiza",
    "mutare",
    "gweru"
  ];

  popularLocations.forEach((location) => {
    sitemapXml += `
  <url>
    <loc>${baseUrl}/search?location=${location}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  sitemapXml += "\n</urlset>";

  return sitemapXml;
}