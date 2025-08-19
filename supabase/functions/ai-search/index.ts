import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, category, userPreferences } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get services from database for context
    let servicesQuery = supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        location,
        price_from,
        rating,
        category:categories(name, slug),
        amenities
      `)
      .eq('active', true);

    if (category && category !== 'all') {
      servicesQuery = servicesQuery.eq('category.slug', category);
    }

    const { data: services, error } = await servicesQuery.limit(50);
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch services from database');
    }

    // Create AI prompt for intelligent search
    const aiPrompt = `
You are an intelligent event planning assistant for ZimEventPro, a marketplace in Zimbabwe. 
Analyze the user's search query and provide smart, contextual results.

User Query: "${query}"
Location: "${location || 'Any location in Zimbabwe'}"
Category: "${category || 'All categories'}"
User Preferences: ${JSON.stringify(userPreferences || {})}

Available Services Context:
${services.map(s => `- ${s.title} (${s.category?.name}) in ${s.location}: ${s.description.substring(0, 100)}...`).join('\n')}

Based on the user's natural language query, please:
1. Interpret their intent (e.g., wedding, birthday party, corporate event)
2. Extract key requirements (budget, guest count, specific services needed)
3. Suggest relevant services from the available options
4. Provide smart recommendations based on typical event planning patterns
5. Consider location preferences and suggest alternatives if needed

Respond in JSON format:
{
  "interpretedIntent": "Brief description of what the user is looking for",
  "extractedRequirements": {
    "eventType": "string",
    "estimatedBudget": "string or null",
    "guestCount": "number or null", 
    "specificServices": ["array of services"],
    "locationPreference": "string"
  },
  "recommendedServices": [
    {
      "serviceId": "id from available services",
      "relevanceScore": 0.95,
      "reasonForRecommendation": "Why this service matches the query"
    }
  ],
  "searchTerms": ["optimized", "search", "keywords"],
  "alternativeLocations": ["if location not specified or not found"],
  "additionalSuggestions": ["helpful tips or alternative ideas"]
}
`;

    // Call OpenAI API for intelligent search analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert event planning assistant with deep knowledge of the Zimbabwe events industry. Provide intelligent, contextual search results and recommendations.' 
          },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiAnalysis = JSON.parse(aiData.choices[0].message.content);

    // Build enhanced search filters based on AI analysis
    const enhancedFilters = {
      originalQuery: query,
      aiInterpretation: aiAnalysis.interpretedIntent,
      searchTerms: aiAnalysis.searchTerms,
      extractedRequirements: aiAnalysis.extractedRequirements,
      recommendedServiceIds: aiAnalysis.recommendedServices.map(r => r.serviceId),
      alternativeLocations: aiAnalysis.alternativeLocations,
      suggestions: aiAnalysis.additionalSuggestions
    };

    // Get recommended services with full details
    const recommendedServices = services.filter(service => 
      aiAnalysis.recommendedServices.some(rec => rec.serviceId === service.id)
    ).map(service => {
      const recommendation = aiAnalysis.recommendedServices.find(rec => rec.serviceId === service.id);
      return {
        ...service,
        relevanceScore: recommendation?.relevanceScore || 0,
        recommendationReason: recommendation?.reasonForRecommendation || ''
      };
    });

    // Log search analytics
    await supabase.from('search_analytics').insert({
      query: query,
      location: location,
      category: category,
      ai_interpretation: aiAnalysis.interpretedIntent,
      results_count: recommendedServices.length,
      user_preferences: userPreferences,
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      aiAnalysis: aiAnalysis,
      enhancedFilters: enhancedFilters,
      recommendedServices: recommendedServices,
      totalResults: recommendedServices.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});