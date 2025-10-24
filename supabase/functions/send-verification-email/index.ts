import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  confirmationUrl: string;
  firstName?: string;
  type?: 'verification' | 'password_reset';
}

interface EmailError {
  code: string;
  message: string;
  statusCode: number;
}

// Enhanced error classification
const classifyEmailError = (error: any): EmailError => {
  // Resend specific errors
  if (error.name === 'validation_error' || error.message?.includes('validation')) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid email address or content',
      statusCode: 400
    };
  }
  
  if (error.name === 'rate_limit_exceeded' || error.message?.includes('rate limit')) {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many emails sent. Please try again later',
      statusCode: 429
    };
  }
  
  if (error.name === 'missing_api_key' || error.message?.includes('API key')) {
    return {
      code: 'MISSING_API_KEY',
      message: 'Email service not configured',
      statusCode: 500
    };
  }
  
  if (error.message?.includes('bounce') || error.message?.includes('invalid recipient')) {
    return {
      code: 'INVALID_RECIPIENT',
      message: 'Email address is invalid or unreachable',
      statusCode: 400
    };
  }
  
  // Network/timeout errors
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT_ERROR',
      message: 'Email service is temporarily unavailable',
      statusCode: 503
    };
  }
  
  // Generic fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Failed to send email due to an unexpected error',
    statusCode: 500
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let requestBody: VerificationEmailRequest | undefined;

  try {
    // Validate request method
    if (req.method !== "POST") {
      console.warn(`Invalid method ${req.method} for email service`);
      return new Response(
        JSON.stringify({ 
          error: "Method not allowed",
          code: "METHOD_NOT_ALLOWED"
        }),
        {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse and validate request body
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request body",
          code: "INVALID_REQUEST_BODY"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!requestBody) {
      console.error("Request body is missing");
      return new Response(
        JSON.stringify({ 
          error: "Request body is required",
          code: "MISSING_REQUEST_BODY"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, confirmationUrl, firstName, type = 'verification' } = requestBody;

    // Validate required fields
    if (!email || !confirmationUrl) {
      console.error("Missing required fields:", { hasEmail: !!email, hasUrl: !!confirmationUrl });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: email and confirmationUrl",
          code: "MISSING_FIELDS"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ 
          error: "Invalid email address format",
          code: "INVALID_EMAIL_FORMAT"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if Resend API key is configured
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error("RESEND_API_KEY environment variable not set");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured",
          code: "EMAIL_SERVICE_NOT_CONFIGURED"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${new Date().toISOString()}] Sending ${type} email to: ${email}`);

    const subject = type === 'password_reset' 
      ? "Reset your ZimEventPro password"
      : "Verify your ZimEventPro account";

    const buttonText = type === 'password_reset'
      ? "Reset My Password"
      : "Verify My Email Address";

    // Extract token and type from confirmation URL for password reset
    let resetToken = '';
    let resetType = '';
    
    if (type === 'password_reset') {
      try {
        const url = new URL(confirmationUrl);
        resetToken = url.searchParams.get('token') || url.hash.split('token=')[1]?.split('&')[0] || '';
        resetType = url.searchParams.get('type') || url.hash.split('type=')[1]?.split('&')[0] || '';
      } catch (e) {
        console.warn('Could not parse confirmation URL:', e);
      }
    }

    const emailResponse = await resend.emails.send({
      from: "ZimEventPro <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; max-width: 100% !important; }
              .header { padding: 30px 20px !important; }
              .content { padding: 30px 20px !important; }
              .hero-icon { font-size: 48px !important; }
              h1 { font-size: 24px !important; }
              h2 { font-size: 20px !important; }
              .cta-button { padding: 14px 28px !important; font-size: 15px !important; }
              .mobile-stack { display: block !important; width: 100% !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 30px 0;">
            <tr>
              <td align="center">
                <table role="presentation" class="container" style="width: 600px; max-width: 100%; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                  
                  <!-- Modern Gradient Header with Icon -->
                  <tr>
                    <td class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%); padding: 50px 40px; text-align: center; position: relative;">
                      <div class="hero-icon" style="font-size: 64px; margin-bottom: 20px; animation: bounce 2s infinite;">
                        ${type === 'password_reset' ? '🔐' : '🎉'}
                      </div>
                      <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                        ZimEventPro
                      </h1>
                      <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0 0; font-size: 15px; font-weight: 500; letter-spacing: 0.5px;">
                        Zimbabwe's Premier Event Platform
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td class="content" style="padding: 50px 40px;">
                      
                      <!-- Greeting Card -->
                      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 24px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
                        <h2 style="color: #1e3a8a; margin: 0 0 12px 0; font-size: 26px; font-weight: 700; line-height: 1.2;">
                          ${type === 'password_reset' ? '🔐 Password Reset Request' : '✨ Welcome to ZimEventPro!'}
                        </h2>
                        <p style="color: #1e40af; font-size: 16px; line-height: 1.5; margin: 0; font-weight: 500;">
                          Hi <strong style="color: #1e3a8a;">${firstName || 'there'}</strong>, ${type === 'password_reset' ? 'let\'s get your account back!' : 'we\'re thrilled to have you! 🎊'}
                        </p>
                      </div>
                      
                      <!-- Main Message -->
                      <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 28px 0;">
                        ${type === 'password_reset' 
                          ? 'We received a request to reset your password. Don\'t worry - your account is safe, and we\'re here to help you regain access in just a few clicks!'
                          : 'You\'ve just joined Zimbabwe\'s most trusted event planning community! Whether you\'re organizing a dream wedding, corporate event, or celebration, we\'re here to make it extraordinary.'
                        }
                      </p>
                      
                      <!-- Token Display for Password Reset -->
                      ${type === 'password_reset' && resetToken ? `
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; margin: 0 0 30px 0; border-left: 4px solid #f59e0b;">
                          <div style="display: flex; align-items: center; margin-bottom: 16px;">
                            <div style="font-size: 28px; margin-right: 12px;">🔑</div>
                            <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 700;">Your Reset Credentials</h3>
                          </div>
                          <div style="background: white; padding: 18px; border-radius: 8px; margin: 0 0 12px 0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #78716c; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Reset Token</p>
                            <code style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace; font-size: 14px; color: #1f2937; word-break: break-all; display: block; line-height: 1.6; font-weight: 600;">${resetToken}</code>
                          </div>
                          ${resetType ? `
                            <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                              <p style="margin: 0 0 10px 0; font-size: 12px; color: #78716c; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Type</p>
                              <code style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace; font-size: 14px; color: #1f2937; font-weight: 600;">${resetType}</code>
                            </div>
                          ` : ''}
                          <p style="font-size: 13px; color: #78716c; margin: 16px 0 0 0; line-height: 1.6;">
                            💡 <strong>Copy these values</strong> to complete your password reset
                          </p>
                        </div>
                      ` : ''}
                      
                      <!-- Premium CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <a href="${confirmationUrl}" 
                               class="cta-button"
                               style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); 
                                      color: white; 
                                      padding: 18px 48px; 
                                      text-decoration: none; 
                                      border-radius: 10px; 
                                      font-weight: 700; 
                                      font-size: 17px; 
                                      display: inline-block;
                                      box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.15);
                                      letter-spacing: 0.3px;
                                      transition: all 0.3s ease;">
                              <span style="display: inline-block; margin-right: 8px;">${type === 'password_reset' ? '🔓' : '✅'}</span>
                              ${buttonText}
                              <span style="display: inline-block; margin-left: 6px;">→</span>
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 30px 0; border: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 600;">
                          <span style="margin-right: 6px;">🔗</span> Button not working? Copy this link:
                        </p>
                        <p style="margin: 0; padding: 0;">
                          <a href="${confirmationUrl}" style="color: #6366f1; word-break: break-all; font-size: 13px; text-decoration: none; font-weight: 500; line-height: 1.6;">${confirmationUrl}</a>
                        </p>
                      </div>
                      
                      <!-- Security Banner -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 10px; margin: 30px 0 0 0; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; align-items: flex-start;">
                          <div style="font-size: 24px; margin-right: 14px; line-height: 1;">🔒</div>
                          <div>
                            <p style="margin: 0 0 8px 0; font-size: 15px; color: #92400e; font-weight: 700;">Security Notice</p>
                            <p style="margin: 0; font-size: 14px; color: #78716c; line-height: 1.6;">
                              ${type === 'password_reset'
                                ? 'Didn\'t request this? Your account is safe. Simply ignore this email and no changes will be made.'
                                : 'This link expires in 24 hours. If you didn\'t sign up for ZimEventPro, you can safely disregard this email.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- What's Next Section (Verification Only) -->
                      ${type === 'verification' ? `
                        <div style="margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border-left: 4px solid #22c55e;">
                          <h3 style="color: #166534; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
                            <span style="font-size: 28px; margin-right: 12px;">🚀</span>
                            What's Next?
                          </h3>
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: start;">
                                  <span style="color: #22c55e; font-size: 20px; margin-right: 14px; line-height: 1;">✓</span>
                                  <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">Discover premium venues, DJs, and catering across Zimbabwe</p>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: start;">
                                  <span style="color: #22c55e; font-size: 20px; margin-right: 14px; line-height: 1;">✓</span>
                                  <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">Book with confidence using secure payment options</p>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: start;">
                                  <span style="color: #22c55e; font-size: 20px; margin-right: 14px; line-height: 1;">✓</span>
                                  <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">Connect with verified, trusted service providers</p>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: start;">
                                  <span style="color: #22c55e; font-size: 20px; margin-right: 14px; line-height: 1;">✓</span>
                                  <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">Unlock exclusive deals and VIP early access</p>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                  
                  <!-- Modern Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 40px 40px 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <div style="margin-bottom: 24px;">
                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                          ZimEventPro
                        </h4>
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; max-width: 400px; margin: 0 auto;">
                          Making your perfect events happen, one booking at a time
                        </p>
                      </div>
                      
                      <div style="margin: 28px 0;">
                        <a href="https://zimeventspro.lovable.app" style="color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 12px;">🏠 Home</a>
                        <span style="color: #d1d5db; margin: 0 4px;">•</span>
                        <a href="https://zimeventspro.lovable.app/help" style="color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 12px;">💬 Help</a>
                        <span style="color: #d1d5db; margin: 0 4px;">•</span>
                        <a href="https://zimeventspro.lovable.app/contact" style="color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 12px;">📧 Contact</a>
                      </div>
                      
                      <div style="border-top: 1px solid #e5e7eb; margin: 24px 0 0 0; padding-top: 24px;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                          © ${new Date().getFullYear()} ZimEventPro. All rights reserved.<br>
                          <span style="color: #d1d5db;">Sent to ${email}</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${type} email sent successfully in ${processingTime}ms:`, {
      messageId: emailResponse.data?.id,
      recipient: email,
      processingTime
    });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      processingTime
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    const classifiedError = classifyEmailError(error);
    
    console.error(`[${new Date().toISOString()}] Email delivery failed after ${processingTime}ms:`, {
      error: error.message,
      stack: error.stack,
      recipient: requestBody?.email || 'unknown',
      errorCode: classifiedError.code,
      processingTime
    });

    // Log additional context for debugging
    if (error.response?.data) {
      console.error("Resend API Error Details:", error.response.data);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: classifiedError.message,
        code: classifiedError.code,
        timestamp: new Date().toISOString()
      }),
      {
        status: classifiedError.statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);