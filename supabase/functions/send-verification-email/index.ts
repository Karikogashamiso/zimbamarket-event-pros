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
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">ZimEventPro</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hi ${firstName || 'there'}! 👋</h2>
            
            <p style="font-size: 16px; margin: 20px 0;">
              ${type === 'password_reset' 
                ? 'We received a request to reset your password for your ZimEventPro account.'
                : 'Thank you for joining Zimbabwe\'s premier event planning platform! We\'re excited to have you on board.'
              }
            </p>
            
            <p style="font-size: 16px; margin: 20px 0;">
              ${type === 'password_reset'
                ? 'Click the button below to reset your password:'
                : 'To get started and secure your account, please verify your email address by clicking the button below:'
              }
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                ${buttonText}
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin: 20px 0;">
              Or copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">Security Note</h3>
              <p style="margin: 0; padding-left: 20px; color: #374151;">
                ${type === 'password_reset'
                  ? 'If you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.'
                  : 'This verification link will expire in 24 hours for security purposes.'
                }
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin: 20px 0;">
              If you're having trouble clicking the button, copy and paste the URL into your web browser.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              ZimEventPro - Zimbabwe's Premier Event Planning Platform<br>
              Making your perfect events happen, one booking at a time.
            </p>
          </div>
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