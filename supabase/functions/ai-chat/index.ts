import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, sessionId, userId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get conversation history
    let conversation;
    if (conversationId) {
      const { data: existingConversation } = await supabaseClient
        .from('chat_conversations')
        .select('id, title')
        .eq('id', conversationId)
        .single();
      
      conversation = existingConversation;
    }

    // Create new conversation if it doesn't exist
    if (!conversation) {
      const { data: newConversation, error: conversationError } = await supabaseClient
        .from('chat_conversations')
        .insert({
          user_id: userId || null,
          session_id: sessionId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          metadata: {
            created_from: 'chat_widget'
          }
        })
        .select()
        .single();

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        throw new Error('Failed to create conversation');
      }

      conversation = newConversation;
    }

    // Get recent messages for context
    const { data: messages, error: messagesError } = await supabaseClient
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      // Continue without context if messages can't be fetched
    }

    // Save user message
    const { error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
    }

    // Prepare messages for OpenAI
    const openAIMessages = [
      {
        role: 'system',
        content: `You are ZimEventPro AI Assistant, a helpful chatbot for Zimbabwe's premier event planning platform. You help users with:

- Finding event venues, catering, DJs, photography, and other event services
- Event planning advice and recommendations
- Information about services available in Zimbabwe (Harare, Bulawayo, Victoria Falls, etc.)
- Booking guidance and pricing questions
- General event planning tips

Key information about ZimEventPro:
- We connect users with verified event professionals across Zimbabwe
- We offer venues, catering, entertainment, photography, decorations, and full event planning
- We serve all major cities: Harare, Bulawayo, Victoria Falls, Mutare, Gweru, Masvingo
- All service providers are thoroughly vetted and background-checked
- We offer instant booking with real-time availability
- 24/7 customer support and satisfaction guarantee

Be friendly, helpful, and knowledgeable about event planning in Zimbabwe. If asked about specific services or pricing, guide users to browse the platform or contact specific vendors. Always maintain a professional yet warm tone.`
      },
      ...(messages || []).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API with GPT-4o-mini (legacy model supports temperature)
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Save AI response
    const { error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiMessage,
      });

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        conversationId: conversation.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});