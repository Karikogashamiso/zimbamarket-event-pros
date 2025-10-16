import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NewsletterConfirmationRequest {
  email: string;
  source?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
    const { email, source = 'website' }: NewsletterConfirmationRequest = await req.json();

    console.log('Sending newsletter confirmation to:', email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: 'Newsletter <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to Our Newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 40px 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
                border-radius: 0 0 10px 10px;
              }
              h1 {
                margin: 0;
                font-size: 28px;
              }
              .welcome-text {
                font-size: 18px;
                margin-bottom: 20px;
                color: #495057;
              }
              .benefits {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .benefits ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              .benefits li {
                margin: 8px 0;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Welcome to Our Newsletter!</h1>
            </div>
            <div class="content">
              <p class="welcome-text">Thank you for subscribing to our newsletter!</p>
              
              <p>We're excited to have you as part of our community. You'll now receive:</p>
              
              <div class="benefits">
                <ul>
                  <li>📧 Latest updates and announcements</li>
                  <li>🎫 Exclusive event invitations</li>
                  <li>💰 Special offers and early bird discounts</li>
                  <li>📰 Industry insights and trends</li>
                  <li>🎁 Subscriber-only perks</li>
                </ul>
              </div>
              
              <p>Stay tuned for exciting content coming your way!</p>
              
              <p style="margin-top: 30px;">
                <strong>Subscribed from:</strong> ${source}
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to our newsletter.</p>
              <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
              <p style="margin-top: 10px; color: #adb5bd; font-size: 11px;">
                © ${new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Newsletter confirmation email sent:', emailResponse);

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      throw emailResponse.error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: emailResponse.data?.id,
        message: 'Confirmation email sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Newsletter confirmation email error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send confirmation email',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
