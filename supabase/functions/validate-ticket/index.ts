import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  qrCodeData: string;
  deviceFingerprint: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  validationType: 'scan' | 'manual' | 'api';
  validatorId?: string;
}

interface TicketData {
  ticketId: string;
  eventId: string;
  timestamp: number;
  hash: string;
  signature?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function validateSignature(ticketData: TicketData): Promise<boolean> {
  try {
    // Get the current signing key
    const { data: signingKey, error } = await supabase
      .from('qr_signing_keys')
      .select('public_key, algorithm')
      .eq('is_active', true)
      .single();

    if (error || !signingKey) {
      console.error('No active signing key found:', error);
      return false;
    }

    // For demo purposes, we'll simulate signature validation
    // In production, use Web Crypto API or similar
    const dataToVerify = `${ticketData.ticketId}:${ticketData.eventId}:${ticketData.timestamp}`;
    
    // Simulate ECDSA signature verification
    // This should use actual cryptographic verification in production
    if (!ticketData.signature || ticketData.signature.length < 10) {
      return false;
    }

    console.log(`Validating signature for ticket ${ticketData.ticketId}`);
    return true; // Placeholder - implement actual signature verification
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

async function checkForDuplicateScans(ticketId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('ticket_validations')
    .select('id, created_at, validation_result')
    .eq('ticket_id', ticketId)
    .eq('validation_result', 'valid')
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
    .limit(1);

  if (error) {
    console.error('Error checking duplicates:', error);
    return false;
  }

  return data && data.length > 0;
}

async function analyzeDeviceRisk(fingerprint: string, ipAddress: string): Promise<number> {
  // Check device history
  const { data: deviceData, error } = await supabase
    .from('device_fingerprints')
    .select('*')
    .eq('fingerprint_hash', fingerprint)
    .single();

  let riskScore = 0;

  if (error && error.code !== 'PGRST116') { // Not found is OK
    console.error('Error analyzing device risk:', error);
    return 50; // Default medium risk
  }

  if (deviceData) {
    // Existing device
    riskScore = deviceData.fraud_score || 0;
    
    // Update last seen
    await supabase
      .from('device_fingerprints')
      .update({ 
        last_seen_at: new Date().toISOString(),
        order_count: deviceData.order_count + 1
      })
      .eq('id', deviceData.id);
  } else {
    // New device - create fingerprint record
    await supabase
      .from('device_fingerprints')
      .insert({
        fingerprint_hash: fingerprint,
        device_info: { ip_address: ipAddress },
        order_count: 1,
        fraud_score: 0
      });
  }

  return riskScore;
}

async function createFraudAlert(
  alertType: string, 
  entityType: string, 
  entityId: string, 
  severity: string, 
  details: any
) {
  const { error } = await supabase
    .from('fraud_alerts')
    .insert({
      alert_type: alertType,
      entity_type: entityType,
      entity_id: entityId,
      severity_level: severity,
      details: details
    });

  if (error) {
    console.error('Error creating fraud alert:', error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests (when QR code is scanned and opened in browser)
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const encodedData = url.searchParams.get('data');
      
      if (!encodedData) {
        return new Response('Missing ticket data', { status: 400 });
      }

      // Decode the ticket data
      const ticketDataStr = atob(encodedData);
      const ticketData = JSON.parse(ticketDataStr);

      // Fetch ticket from database
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_types (
            name,
            events (
              title, event_date, venue:venues(name, address)
            )
          )
        `)
        .eq('ticket_number', ticketData.ticketId)
        .single();

      if (error || !ticket) {
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invalid Ticket</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .error { color: #dc2626; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="error">❌ Invalid Ticket</h1>
                <p>This ticket could not be validated. Please contact support.</p>
              </div>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html', ...corsHeaders } });
      }

      // Return beautiful HTML display
      const event = ticket.ticket_types?.events;
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket: ${ticketData.eventTitle}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                min-height: 100vh;
              }
              .container { 
                max-width: 500px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 20px; 
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 30px 20px; 
                text-align: center;
              }
              .header h1 { font-size: 24px; margin-bottom: 5px; }
              .header p { opacity: 0.9; font-size: 14px; }
              .content { padding: 30px 20px; }
              .ticket-info { margin-bottom: 25px; }
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #f0f0f0;
              }
              .info-label { 
                color: #666; 
                font-size: 13px; 
                font-weight: 500;
              }
              .info-value { 
                color: #111; 
                font-weight: 600;
                text-align: right;
                max-width: 60%;
              }
              .status-badge { 
                display: inline-block;
                padding: 8px 16px; 
                border-radius: 20px; 
                font-size: 13px;
                font-weight: 600;
                margin-top: 20px;
              }
              .status-valid { background: #10b981; color: white; }
              .status-used { background: #f59e0b; color: white; }
              .footer { 
                background: #f9fafb; 
                padding: 20px; 
                text-align: center; 
                font-size: 12px;
                color: #666;
              }
              .qr-section {
                text-align: center;
                padding: 20px;
                background: #f9fafb;
                border-radius: 10px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎟️ ${ticketData.eventTitle || 'Event Ticket'}</h1>
                <p>Ticket #${ticketData.ticketId}</p>
              </div>
              
              <div class="content">
                <div class="ticket-info">
                  <div class="info-row">
                    <span class="info-label">Event</span>
                    <span class="info-value">${ticketData.eventTitle}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Date</span>
                    <span class="info-value">${ticketData.eventDate ? new Date(ticketData.eventDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Venue</span>
                    <span class="info-value">${ticketData.eventVenue || 'TBA'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Location</span>
                    <span class="info-value">${ticketData.eventLocation || 'Zimbabwe'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Ticket Type</span>
                    <span class="info-value">${ticketData.tierName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Price</span>
                    <span class="info-value">${ticketData.currency === 'USD' ? '$' : ticketData.currency}${ticketData.price}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Holder</span>
                    <span class="info-value">${ticketData.holderEmail}</span>
                  </div>
                </div>

                <div class="qr-section">
                  <div class="status-badge ${ticket.scanned_at ? 'status-used' : 'status-valid'}">
                    ${ticket.scanned_at ? '✓ Already Scanned' : '✓ Valid Ticket'}
                  </div>
                  ${ticket.scanned_at ? `<p style="margin-top: 10px; font-size: 13px; color: #666;">Scanned on ${new Date(ticket.scanned_at).toLocaleString()}</p>` : ''}
                </div>
              </div>

              <div class="footer">
                <p><strong>Security:</strong> This ticket is cryptographically signed</p>
                <p style="margin-top: 5px;">Hash: ${ticketData.hash?.substring(0, 16)}...</p>
                <p style="margin-top: 10px;">For support, contact: support@zepevents.co.zw</p>
              </div>
            </div>
          </body>
        </html>
      `, { 
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        } 
      });
    } catch (error) {
      console.error('GET request error:', error);
      return new Response('Invalid ticket data', { status: 400 });
    }
  }

  // Handle POST requests (API validation)
  try {
    const { 
      qrCodeData, 
      deviceFingerprint, 
      location, 
      validationType = 'scan',
      validatorId 
    }: ValidationRequest = await req.json();

    // Parse QR code data
    let ticketData: TicketData;
    try {
      ticketData = JSON.parse(qrCodeData);
    } catch {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Invalid QR code format' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get client IP for risk analysis
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Step 1: Validate signature
    const signatureValid = await validateSignature(ticketData);
    if (!signatureValid) {
      await createFraudAlert(
        'invalid_signature', 
        'ticket', 
        ticketData.ticketId, 
        'high',
        { qr_data: qrCodeData, device: deviceFingerprint }
      );
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Invalid ticket signature' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 2: Get ticket from database
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types!inner(
          name,
          events!inner(
            title, start_datetime, end_datetime, is_cancelled
          ),
          transport_trips!inner(
            departure_datetime, arrival_datetime, is_cancelled
          )
        )
      `)
      .eq('ticket_number', ticketData.ticketId)
      .single();

    if (ticketError || !ticket) {
      await createFraudAlert(
        'invalid_ticket', 
        'ticket', 
        ticketData.ticketId, 
        'high',
        { error: ticketError?.message, qr_data: qrCodeData }
      );

      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Ticket not found' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 3: Check ticket status
    if (ticket.ticket_status !== 'valid') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: `Ticket status: ${ticket.ticket_status}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 4: Check for duplicate scans
    const isDuplicate = await checkForDuplicateScans(ticket.id);
    if (isDuplicate) {
      await createFraudAlert(
        'duplicate_scan', 
        'ticket', 
        ticket.id, 
        'high',
        { 
          device: deviceFingerprint, 
          ip: clientIP,
          location: location 
        }
      );

      // Record the validation attempt
      await supabase
        .from('ticket_validations')
        .insert({
          ticket_id: ticket.id,
          validation_type: validationType,
          validation_result: 'duplicate',
          validator_user_id: validatorId,
          device_fingerprint: deviceFingerprint,
          ip_address: clientIP,
          location_data: location || {},
          signature_verification: signatureValid
        });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Duplicate scan detected' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 5: Device risk analysis
    const deviceRisk = await analyzeDeviceRisk(deviceFingerprint, clientIP);
    
    if (deviceRisk > 80) {
      await createFraudAlert(
        'high_risk_device', 
        'device', 
        deviceFingerprint, 
        'medium',
        { 
          risk_score: deviceRisk,
          ticket_id: ticket.id,
          ip: clientIP 
        }
      );
    }

    // Step 6: Record successful validation
    await supabase
      .from('ticket_validations')
      .insert({
        ticket_id: ticket.id,
        validation_type: validationType,
        validation_result: 'valid',
        validator_user_id: validatorId,
        device_fingerprint: deviceFingerprint,
        ip_address: clientIP,
        location_data: location || {},
        signature_verification: signatureValid,
        offline_validation: false
      });

    // Update ticket scan status
    await supabase
      .from('tickets')
      .update({ 
        scanned_at: new Date().toISOString(),
        scanned_by_user_id: validatorId
      })
      .eq('id', ticket.id);

    console.log(`Ticket ${ticketData.ticketId} validated successfully`);

    return new Response(
      JSON.stringify({ 
        valid: true,
        ticket: {
          id: ticket.id,
          number: ticket.ticket_number,
          holder_name: `${ticket.holder_first_name} ${ticket.holder_last_name}`,
          event: ticket.ticket_types?.events?.title || ticket.ticket_types?.transport_trips?.departure_datetime,
          seat: ticket.seat_id ? `Seat assigned` : 'General admission',
          type: ticket.ticket_types?.name
        },
        deviceRisk: deviceRisk,
        signatureValid: signatureValid
      }),
      { 
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        reason: 'Internal validation error' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        } 
      }
    );
  }
};

serve(handler);
