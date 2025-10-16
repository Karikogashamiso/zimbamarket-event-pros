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
              .container { padding: 10px !important; }
              .header { padding: 20px !important; }
              .content { padding: 20px !important; }
              h1 { font-size: 24px !important; }
              h2 { font-size: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" class="container" style="width: 600px; max-width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td class="header" style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%); padding: 40px 30px; text-align: center;">
                      <div style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 8px; padding: 20px; display: inline-block;">
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎉 ZimEventPro</h1>
                        <p style="color: rgba(255, 255, 255, 0.95); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Zimbabwe's Premier Event Platform</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td class="content" style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        ${type === 'password_reset' ? '🔐 Password Reset Request' : '✨ Welcome Aboard!'}
                      </h2>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hi <strong>${firstName || 'there'}</strong>,
                      </p>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                        ${type === 'password_reset' 
                          ? 'We received a request to reset your password for your ZimEventPro account. No worries - we\'ve got you covered!'
                          : 'Thank you for joining Zimbabwe\'s most trusted event planning platform! 🎊 Whether you\'re organizing a wedding, conference, or celebration, we\'re here to make it unforgettable.'
                        }
                      </p>
                      
                      ${type === 'password_reset' && resetToken ? `
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 8px; margin: 0 0 25px 0; border-left: 4px solid #3b82f6;">
                          <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🔑 Your Reset Code</h3>
                          <div style="background: white; padding: 15px; border-radius: 6px; margin: 0 0 10px 0; border: 1px solid #bfdbfe;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Token</p>
                            <code style="font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937; word-break: break-all; display: block; line-height: 1.5;">${resetToken}</code>
                          </div>
                          ${resetType ? `
                            <div style="background: white; padding: 15px; border-radius: 6px; margin: 0; border: 1px solid #bfdbfe;">
                              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Type</p>
                              <code style="font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937;">${resetType}</code>
                            </div>
                          ` : ''}
                          <p style="font-size: 13px; color: #6b7280; margin: 12px 0 0 0; line-height: 1.5;">
                            💡 Copy these values to complete your password reset
                          </p>
                        </div>
                      ` : ''}
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${confirmationUrl}" 
                               style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); 
                                      color: white; 
                                      padding: 16px 40px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      font-weight: 600; 
                                      font-size: 16px; 
                                      display: inline-block;
                                      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                                      transition: all 0.3s ease;">
                              ${buttonText} →
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 25px 0; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; padding: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                          <strong>Having trouble?</strong> Copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; padding: 0;">
                          <a href="${confirmationUrl}" style="color: #6366f1; word-break: break-all; font-size: 13px; text-decoration: underline;">${confirmationUrl}</a>
                        </p>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 25px 0 0 0; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                          <strong style="display: block; margin-bottom: 8px;">🔒 Security Notice</strong>
                          ${type === 'password_reset'
                            ? 'If you didn\'t request this password reset, you can safely ignore this email. Your account remains secure and no changes will be made.'
                            : 'This verification link will expire in 24 hours for your security. If you didn\'t create this account, please disregard this email.'
                          }
                        </p>
                      </div>
                      
                      ${type === 'verification' ? `
                        <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #f3f4f6;">
                          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Next?</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                            <li>Discover amazing venues, DJs, and catering services</li>
                            <li>Book your perfect event with secure payment options</li>
                            <li>Connect with trusted service providers across Zimbabwe</li>
                            <li>Get exclusive deals and early access to new features</li>
                          </ul>
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                        ZimEventPro
                      </p>
                      <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Making your perfect events happen, one booking at a time<br>
                        Zimbabwe's Premier Event Planning Platform
                      </p>
                      <div style="margin: 20px 0;">
                        <a href="#" style="color: #6366f1; text-decoration: none; font-size: 14px; margin: 0 10px;">Help Center</a>
                        <span style="color: #d1d5db;">|</span>
                        <a href="#" style="color: #6366f1; text-decoration: none; font-size: 14px; margin: 0 10px;">Contact Us</a>
                        <span style="color: #d1d5db;">|</span>
                        <a href="#" style="color: #6366f1; text-decoration: none; font-size: 14px; margin: 0 10px;">Privacy</a>
                      </div>
                      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                        © ${new Date().getFullYear()} ZimEventPro. All rights reserved.<br>
                        This email was sent to ${email}
                      </p>
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