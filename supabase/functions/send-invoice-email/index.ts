import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  orderNumber: string;
  recipientEmail?: string;
}

const formatCurrency = (amount: number, currency = "USD") => {
  const symbol = currency === "USD" ? "$" : currency === "ZWL" ? "Z$" : "RTGS$";
  return `${symbol}${amount.toFixed(2)}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, recipientEmail }: InvoiceEmailRequest = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Fetch tickets
    const { data: tickets } = await supabaseClient
      .from("tickets")
      .select(`
        *,
        ticket_types (
          name,
          description
        )
      `)
      .eq("order_id", order.id);

    const emailTo = recipientEmail || order.customer_email;

    // Build ticket rows HTML
    let ticketRowsHTML = "";
    if (tickets && tickets.length > 0) {
      tickets.forEach((ticket: any) => {
        ticketRowsHTML += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ticket.ticket_types?.name || "Ticket"}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">1</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(ticket.paid_price || ticket.original_price || 0, order.currency)}</td>
          </tr>
        `;
      });
    } else {
      ticketRowsHTML = `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Order Items</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">-</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(order.subtotal, order.currency)}</td>
        </tr>
      `;
    }

    // Event details HTML (if available)
    let eventDetailsHTML = "";
    if (order.metadata?.event) {
      eventDetailsHTML = `
        <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">Event Details</h3>
          <p style="margin: 4px 0;"><strong>Event:</strong> ${order.metadata.event.title}</p>
          ${order.metadata.event.date ? `<p style="margin: 4px 0;"><strong>Date:</strong> ${order.metadata.event.date}</p>` : ""}
          ${order.metadata.event.venue ? `<p style="margin: 4px 0;"><strong>Venue:</strong> ${order.metadata.event.venue}</p>` : ""}
        </div>
      `;
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
            .total-row { background-color: #f9fafb; font-weight: bold; font-size: 16px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">ZimEventPro</h1>
              <p style="margin: 10px 0 0 0;">Invoice</p>
            </div>
            <div class="content">
              <h2 style="color: #10b981; margin-top: 0;">Thank you for your order!</h2>
              
              <div style="margin: 20px 0;">
                <p><strong>Order Number:</strong> ${order.order_number}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: 600;">${order.payment_status}</span></p>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

              <h3>Bill To:</h3>
              <p style="margin: 5px 0;">${order.customer_first_name} ${order.customer_last_name}</p>
              <p style="margin: 5px 0;">${order.customer_email}</p>
              ${order.customer_phone ? `<p style="margin: 5px 0;">${order.customer_phone}</p>` : ""}

              ${eventDetailsHTML}

              <h3 style="margin-top: 30px;">Order Details:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRowsHTML}
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right;">${formatCurrency(order.subtotal, order.currency)}</td>
                  </tr>
                  ${order.service_fee > 0 ? `
                    <tr>
                      <td colspan="2" style="padding: 12px; text-align: right;">Service Fee:</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(order.service_fee, order.currency)}</td>
                    </tr>
                  ` : ""}
                  ${order.tax_amount > 0 ? `
                    <tr>
                      <td colspan="2" style="padding: 12px; text-align: right;">Tax:</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(order.tax_amount, order.currency)}</td>
                    </tr>
                  ` : ""}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
                    <td style="padding: 12px; text-align: right; color: #10b981;">${formatCurrency(order.total_amount, order.currency)}</td>
                  </tr>
                </tbody>
              </table>

              ${order.special_requests ? `
                <div style="margin-top: 20px;">
                  <p><strong>Special Requests:</strong></p>
                  <p style="background-color: #f9fafb; padding: 12px; border-radius: 4px;">${order.special_requests}</p>
                </div>
              ` : ""}
            </div>
            <div class="footer">
              <p>Thank you for choosing ZimEventPro!</p>
              <p>For support, contact: support@zimeventpro.com | WhatsApp: +263 77 123 4567</p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ZimEventPro <onboarding@resend.dev>",
      to: [emailTo],
      subject: `Invoice - Order ${order.order_number}`,
      html: emailHTML,
    });

    console.log("Invoice email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Invoice email sent successfully",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
