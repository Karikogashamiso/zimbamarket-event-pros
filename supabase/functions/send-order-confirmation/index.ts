import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderDetails: {
    order_number: string;
    customer_email: string;
    customer_first_name: string;
    customer_last_name: string;
    total_amount: number;
    currency: string;
    payment_status: string;
    booking_status: string;
    created_at: string;
    metadata?: any;
    tickets?: Array<{
      id: string;
      ticket_number: string;
      ticket_type_name: string;
      qr_code_data: string;
    }>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Order confirmation email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderDetails }: OrderConfirmationRequest = await req.json();
    console.log("Processing order confirmation for:", orderDetails.order_number);

    const formatCurrency = (amount: number, currency: string) => {
      const symbol = currency === 'USD' ? '$' : currency === 'ZWL' ? 'Z$' : 'RTGS$';
      return `${symbol}${amount.toFixed(2)}`;
    };

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Generate ticket list HTML
    const ticketsHtml = orderDetails.tickets?.map(ticket => `
      <div style="background: #f8f9fa; padding: 16px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #4f46e5;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">${ticket.ticket_type_name || 'General Admission'}</h4>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Ticket #${ticket.ticket_number || 'N/A'}</p>
        ${ticket.qr_code_data ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">QR Code: ${ticket.qr_code_data.substring(0, 20)}...</p>` : ''}
      </div>
    `).join('') || '<p>No tickets generated</p>';

    const eventInfo = orderDetails.metadata?.event ? `
      <div style="background: #f0f9ff; padding: 16px; margin: 16px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #1e40af;">Event Details</h3>
        <p style="margin: 4px 0; color: #374151;"><strong>Event:</strong> ${orderDetails.metadata.event.title || 'N/A'}</p>
        ${orderDetails.metadata.event.date ? `<p style="margin: 4px 0; color: #374151;"><strong>Date:</strong> ${orderDetails.metadata.event.date}</p>` : ''}
        ${orderDetails.metadata.event.venue ? `<p style="margin: 4px 0; color: #374151;"><strong>Venue:</strong> ${orderDetails.metadata.event.venue}</p>` : ''}
        ${orderDetails.metadata.event.location ? `<p style="margin: 4px 0; color: #374151;"><strong>Location:</strong> ${orderDetails.metadata.event.location}</p>` : ''}
      </div>
    ` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - ${orderDetails.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4f46e5; margin: 0;">ZimEventPro</h1>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Your booking is confirmed!</p>
          </div>

          <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0;">🎉 Booking Confirmed!</h2>
            <p style="margin: 0; font-size: 18px;">Order #${orderDetails.order_number}</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order Number:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${orderDetails.order_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #10b981; font-weight: bold;">${formatCurrency(orderDetails.total_amount, orderDetails.currency)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Payment Status:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #10b981;">${orderDetails.payment_status}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Booking Date:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${formatDate(orderDetails.created_at)}</td>
              </tr>
            </table>
          </div>

          ${eventInfo}

          <div style="margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Your Tickets</h3>
            ${ticketsHtml}
          </div>

          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #92400e;">📱 Important Information</h4>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>Please save this email as your booking reference</li>
              <li>Show your QR code at the venue for entry</li>
              <li>Arrive 30 minutes before the event start time</li>
              <li>Contact us if you need to make any changes</li>
            </ul>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">Need Help?</h4>
            <p style="margin: 0; color: #374151;">
              If you have any questions about your booking:
            </p>
            <p style="margin: 10px 0 0 0; color: #374151;">
              📧 Email: <a href="mailto:support@zimeventpro.com" style="color: #4f46e5;">support@zimeventpro.com</a><br>
              📱 WhatsApp: <a href="https://wa.me/263771234567" style="color: #4f46e5;">+263 77 123 4567</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Thank you for choosing ZimEventPro!<br>
              Zimbabwe's premier event planning marketplace
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ZimEventPro <orders@zimeventpro.com>",
      to: [orderDetails.customer_email],
      subject: `🎉 Booking Confirmed - Order #${orderDetails.order_number}`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      processingTime: Date.now() 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);