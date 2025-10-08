import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationConfirmationRequest {
  email: string;
  businessName: string;
  contactPerson: string;
  businessType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, businessName, contactPerson, businessType }: ApplicationConfirmationRequest = await req.json();

    console.log("Sending application confirmation to:", email);

    const emailResponse = await resend.emails.send({
      from: "ZimEventPro <onboarding@resend.dev>",
      to: [email],
      subject: "Business Application Received - ZimEventPro",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Received</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          ✅ Application Received!
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                          Dear <strong>${contactPerson}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                          Thank you for submitting your business application to <strong>ZimEventPro</strong>! We're excited to potentially have you join our platform.
                        </p>
                        
                        <!-- Application Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0; overflow: hidden;">
                          <tr>
                            <td style="padding: 20px;">
                              <h3 style="margin: 0 0 15px; font-size: 18px; color: #667eea; font-weight: 600;">
                                📋 Application Details
                              </h3>
                              <table width="100%" cellpadding="8" cellspacing="0" border="0">
                                <tr>
                                  <td style="font-size: 14px; color: #666666; width: 40%;">Business Name:</td>
                                  <td style="font-size: 14px; color: #333333; font-weight: 600;">${businessName}</td>
                                </tr>
                                <tr>
                                  <td style="font-size: 14px; color: #666666; width: 40%;">Business Type:</td>
                                  <td style="font-size: 14px; color: #333333; font-weight: 600;">${businessType}</td>
                                </tr>
                                <tr>
                                  <td style="font-size: 14px; color: #666666; width: 40%;">Status:</td>
                                  <td>
                                    <span style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #d97706; border-radius: 4px; font-size: 13px; font-weight: 600;">
                                      ⏳ Pending Review
                                    </span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Next Steps -->
                        <div style="background-color: #eff6ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                          <h3 style="margin: 0 0 12px; font-size: 18px; color: #667eea; font-weight: 600;">
                            🎯 What Happens Next?
                          </h3>
                          <ol style="margin: 0; padding-left: 20px; color: #333333; line-height: 1.8;">
                            <li style="margin-bottom: 8px;">Our team will review your application within <strong>24 hours</strong></li>
                            <li style="margin-bottom: 8px;">We'll verify your business information and credentials</li>
                            <li style="margin-bottom: 8px;">You'll receive an email notification with the decision</li>
                            <li style="margin-bottom: 8px;">Once approved, you can start managing your business listing</li>
                          </ol>
                        </div>
                        
                        <p style="margin: 30px 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                          You can check your application status anytime by logging into your account.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${Deno.env.get("SUPABASE_URL")?.replace("https://", "http://localhost:8080/") || "http://localhost:8080/"}" 
                             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            View Application Status
                          </a>
                        </div>
                        
                        <p style="margin: 30px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                          If you have any questions, feel free to reach out to our support team.
                        </p>
                        
                        <p style="margin: 20px 0 0; font-size: 16px; color: #333333; line-height: 1.6;">
                          Best regards,<br>
                          <strong>The ZimEventPro Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">
                          © 2025 ZimEventPro. Zimbabwe's Premier Event Planning Platform.<br>
                          This is an automated email. Please do not reply directly to this message.
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-business-application-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
