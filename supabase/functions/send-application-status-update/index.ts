import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  email: string;
  businessName: string;
  contactPerson: string;
  status: "approved" | "rejected";
  categoryName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, businessName, contactPerson, status, categoryName }: StatusUpdateRequest = await req.json();

    console.log(`Sending ${status} notification to:`, email);

    const isApproved = status === "approved";
    
    const emailResponse = await resend.emails.send({
      from: "ZimEventPro <onboarding@resend.dev>",
      to: [email],
      subject: isApproved 
        ? `🎉 Your Business Application Has Been Approved!` 
        : `Application Update - ZimEventPro`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application ${isApproved ? 'Approved' : 'Update'}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'}; padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          ${isApproved ? '🎉 Congratulations!' : '📋 Application Update'}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                          Dear <strong>${contactPerson}</strong>,
                        </p>
                        
                        ${isApproved ? `
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                          Great news! Your business application for <strong>${businessName}</strong> has been <strong style="color: #10b981;">APPROVED</strong>! 🎊
                        </p>
                        
                        <!-- Success Box -->
                        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                          <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                          <h2 style="margin: 0 0 10px; color: #065f46; font-size: 24px; font-weight: 700;">
                            Your Business is Now Live!
                          </h2>
                          <p style="margin: 0; color: #047857; font-size: 16px;">
                            Welcome to the ZimEventPro family
                          </p>
                        </div>
                        
                        <!-- Application Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0; overflow: hidden;">
                          <tr>
                            <td style="padding: 20px;">
                              <h3 style="margin: 0 0 15px; font-size: 18px; color: #10b981; font-weight: 600;">
                                📋 Listing Details
                              </h3>
                              <table width="100%" cellpadding="8" cellspacing="0" border="0">
                                <tr>
                                  <td style="font-size: 14px; color: #666666; width: 40%;">Business Name:</td>
                                  <td style="font-size: 14px; color: #333333; font-weight: 600;">${businessName}</td>
                                </tr>
                                ${categoryName ? `
                                <tr>
                                  <td style="font-size: 14px; color: #666666; width: 40%;">Category:</td>
                                  <td style="font-size: 14px; color: #333333; font-weight: 600;">${categoryName}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                  <td style="font-size: 14px; color: #666666; width: 40%;">Status:</td>
                                  <td>
                                    <span style="display: inline-block; padding: 4px 12px; background-color: #d1fae5; color: #065f46; border-radius: 4px; font-size: 13px; font-weight: 600;">
                                      ✅ Approved & Active
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
                            🚀 Get Started Now
                          </h3>
                          <ol style="margin: 0; padding-left: 20px; color: #333333; line-height: 1.8;">
                            <li style="margin-bottom: 8px;">Complete your business profile with photos and details</li>
                            <li style="margin-bottom: 8px;">Set your pricing and availability</li>
                            <li style="margin-bottom: 8px;">Start receiving booking requests from customers</li>
                            <li style="margin-bottom: 8px;">Respond to inquiries and grow your business</li>
                          </ol>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${Deno.env.get("SUPABASE_URL")?.replace("https://", "http://localhost:8080/organizer") || "http://localhost:8080/organizer"}" 
                             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                            Access Your Dashboard
                          </a>
                        </div>
                        ` : `
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                          Thank you for your interest in joining ZimEventPro. After careful review, we're unable to approve your application for <strong>${businessName}</strong> at this time.
                        </p>
                        
                        <!-- Info Box -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                          <h3 style="margin: 0 0 12px; font-size: 18px; color: #d97706; font-weight: 600;">
                            📝 What You Can Do
                          </h3>
                          <ul style="margin: 0; padding-left: 20px; color: #333333; line-height: 1.8;">
                            <li style="margin-bottom: 8px;">Review and update your business information</li>
                            <li style="margin-bottom: 8px;">Ensure all required documents are submitted</li>
                            <li style="margin-bottom: 8px;">Contact our support team for clarification</li>
                            <li style="margin-bottom: 8px;">Resubmit your application when ready</li>
                          </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${Deno.env.get("SUPABASE_URL")?.replace("https://", "http://localhost:8080/list-business") || "http://localhost:8080/list-business"}" 
                             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            Resubmit Application
                          </a>
                        </div>
                        `}
                        
                        <p style="margin: 30px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                          If you have any questions, our support team is here to help.
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
    console.error("Error in send-application-status-update:", error);
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
