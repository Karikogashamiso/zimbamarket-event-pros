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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, firstName }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "ZimEventPro <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your ZimEventPro account",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ZimEventPro!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hi ${firstName || 'there'}! 👋</h2>
            
            <p style="font-size: 16px; margin: 20px 0;">
              Thank you for joining Zimbabwe's premier event planning platform! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; margin: 20px 0;">
              To get started and secure your account, please verify your email address by clicking the button below:
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
                Verify My Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin: 20px 0;">
              Or copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li>Browse thousands of verified event professionals</li>
                <li>Book venues, caterers, DJs, and more</li>
                <li>Manage your bookings in one place</li>
                <li>Connect with Zimbabwe's best event services</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666; margin: 20px 0;">
              If you didn't create an account with us, you can safely ignore this email.
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

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send verification email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);