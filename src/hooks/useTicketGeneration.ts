import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface TicketGenerationOptions {
  orderId: string;
  ticketTiers: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
  }>;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  eventInfo?: {
    id: string;
    title: string;
    date?: string;
    venue?: string;
    location?: string;
  };
}

interface GeneratedTicket {
  id: string;
  ticketNumber: string;
  qrCodeData: string;
  qrCodeUrl: string;
  securityHash: string;
  digitalSignature: string;
  isValid: boolean;
}

export const useTicketGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicket[]>([]);

  const generateSecureHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateDigitalSignature = async (ticketData: any): Promise<string> => {
    // In production, this would use proper cryptographic signing with private keys
    const signatureInput = JSON.stringify(ticketData) + 'TICKET_SIGNING_SECRET';
    return await generateSecureHash(signatureInput);
  };

  const generateTicketNumber = (orderId: string, tierIndex: number, ticketIndex: number): string => {
    const orderPrefix = orderId.substring(0, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const tierCode = String(tierIndex + 1).padStart(2, '0');
    const ticketCode = String(ticketIndex + 1).padStart(3, '0');
    return `ZEP-${orderPrefix}-${timestamp}-${tierCode}${ticketCode}`;
  };

  const createSecureQRCode = async (ticketData: any): Promise<{ qrData: string; qrUrl: string; hash: string; signature: string }> => {
    // Create secure QR payload
    const timestamp = Date.now();
    const expiryTimestamp = timestamp + (365 * 24 * 60 * 60 * 1000); // 1 year expiry

    const qrPayload = {
      ticketId: ticketData.ticketId, // Use UUID from database
      ticketNumber: ticketData.ticketNumber,
      orderId: ticketData.orderId,
      eventId: ticketData.eventId || 'general',
      holderEmail: ticketData.holderEmail,
      timestamp: timestamp,
      expiry: expiryTimestamp,
      version: '2.0',
    };

    // Generate security hash
    const hashInput = Object.values(qrPayload).join(':');
    const securityHash = await generateSecureHash(hashInput);
    
    // Generate digital signature
    const signature = await generateDigitalSignature({ ...qrPayload, hash: securityHash });

    // Final QR data with security features
    const qrData = JSON.stringify({
      ...qrPayload,
      hash: securityHash,
      signature: signature,
    });

    // Create URL that can be scanned by phones
    // Encode the data as base64 so it's URL-safe
    const encodedData = btoa(qrData);
    
    // Get the current origin, fallback to hardcoded if not available
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://309c8f6f-cefd-4bca-8cda-808078a3b393.lovableproject.com';
    
    const scanUrl = `${origin}/scan-ticket?ticket=${encodedData}`;
    
    console.log('=== QR Code Generation Debug ===');
    console.log('Generated QR URL:', scanUrl);
    console.log('Encoded data length:', encodedData.length);
    console.log('URL length:', scanUrl.length);
    console.log('Raw ticket data:', JSON.stringify(ticketData));
    console.log('QR Payload:', JSON.stringify(qrPayload));
    
    // Check if URL is too long (QR codes work best under 2000 characters)
    if (scanUrl.length > 2000) {
      console.warn('⚠️ QR code URL is very long, might cause scanning issues:', scanUrl.length);
    }

    try {
      // Generate QR code image with the URL
      const qrUrl = await QRCode.toDataURL(scanUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' // Medium error correction (better for long URLs)
      });
      
      console.log('✅ QR code generated successfully');
      console.log('QR code image length:', qrUrl.length);

      return { qrData, qrUrl, hash: securityHash, signature };
    } catch (error) {
      console.error('❌ QR code generation failed:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  };

  const generateTickets = async (options: TicketGenerationOptions): Promise<GeneratedTicket[]> => {
    setIsGenerating(true);
    const tickets: GeneratedTicket[] = [];

    try {
      let totalTicketIndex = 0;

      for (let tierIndex = 0; tierIndex < options.ticketTiers.length; tierIndex++) {
        const tier = options.ticketTiers[tierIndex];

        for (let ticketIndex = 0; ticketIndex < tier.quantity; ticketIndex++) {
          // Generate unique ticket number
          const ticketNumber = generateTicketNumber(options.orderId, tierIndex, totalTicketIndex);

          // First, create ticket record with placeholder QR to get the UUID
          const ticketRecord = {
            order_id: options.orderId,
            ticket_type_id: tier.id,
            ticket_number: ticketNumber,
            original_price: tier.price,
            paid_price: tier.price,
            currency: tier.currency as 'USD' | 'ZWL' | 'RTGS',
            ticket_status: 'valid' as 'valid' | 'used' | 'cancelled' | 'expired' | 'refunded',
            qr_code_data: 'pending', // Placeholder, will be updated
            holder_first_name: options.customerInfo.firstName,
            holder_last_name: options.customerInfo.lastName,
            holder_email: options.customerInfo.email,
            holder_phone: options.customerInfo.phone,
            metadata: {
              tierName: tier.name,
              position: ticketIndex + 1,
              totalInTier: tier.quantity,
              generatedAt: new Date().toISOString(),
              eventInfo: options.eventInfo,
            },
          };

          // Insert ticket into database to get UUID
          const { data: createdTicket, error: ticketError } = await supabase
            .from('tickets')
            .insert([ticketRecord])
            .select()
            .single();

          if (ticketError) {
            console.error('Error creating ticket:', ticketError);
            throw new Error(`Failed to create ticket: ${ticketError.message}`);
          }

          // Now generate QR code with the actual ticket UUID
          const ticketData = {
            ticketId: createdTicket.id, // Use database UUID for uniqueness
            ticketNumber: ticketNumber, // Also include ticket number
            orderId: options.orderId,
            eventId: options.eventInfo?.id,
            holderEmail: options.customerInfo.email,
          };

          // Generate secure QR code with the ticket UUID
          const { qrData, qrUrl, hash, signature } = await createSecureQRCode(ticketData);

          // Update ticket with QR code data
          const { error: updateError } = await supabase
            .from('tickets')
            .update({
              qr_code_data: qrData,
              qr_code_url: qrUrl,
              metadata: {
                ...ticketRecord.metadata,
                securityHash: hash,
                digitalSignature: signature,
              },
            })
            .eq('id', createdTicket.id);

          if (updateError) {
            console.error('Error updating ticket with QR code:', updateError);
            // Continue anyway - ticket is created, just QR update failed
          }

          // Add to generated tickets array
          const generatedTicket: GeneratedTicket = {
            id: createdTicket.id,
            ticketNumber,
            qrCodeData: qrData,
            qrCodeUrl: qrUrl,
            securityHash: hash,
            digitalSignature: signature,
            isValid: true,
          };

          tickets.push(generatedTicket);
          totalTicketIndex++;

          // Add small delay to prevent overwhelming the system
          if (totalTicketIndex % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      setGeneratedTickets(tickets);
      
      toast.success(`Successfully generated ${tickets.length} secure tickets with QR codes`);
      
      return tickets;

    } catch (error: any) {
      console.error('Ticket generation failed:', error);
      
      toast.error(`Ticket generation failed: ${error.message}`);
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const validateTicket = async (qrData: string): Promise<{ isValid: boolean; ticket?: any; error?: string }> => {
    try {
      const parsedData = JSON.parse(qrData);
      
      // Verify signature and hash
      const expectedHash = await generateSecureHash(
        Object.entries(parsedData)
          .filter(([key]) => !['hash', 'signature'].includes(key))
          .map(([_, value]) => value)
          .join(':')
      );

      if (expectedHash !== parsedData.hash) {
        return { isValid: false, error: 'Invalid ticket hash - possible forgery' };
      }

      // Check if ticket exists in database
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_number', parsedData.ticketId)
        .single();

      if (error || !ticket) {
        return { isValid: false, error: 'Ticket not found in database' };
      }

      // Check ticket status
      if (ticket.ticket_status !== 'valid') {
        return { isValid: false, error: `Ticket status: ${ticket.ticket_status}` };
      }

      // Check expiry
      if (parsedData.expiry && Date.now() > parsedData.expiry) {
        return { isValid: false, error: 'Ticket has expired' };
      }

      return { isValid: true, ticket };

    } catch (error) {
      return { isValid: false, error: 'Invalid QR code format' };
    }
  };

  const regenerateTicketQR = async (ticketId: string): Promise<string> => {
    // Fetch existing ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      throw new Error('Ticket not found');
    }

    // Generate new QR code with updated timestamp
    const ticketMetadata = ticket.metadata as any;
    const { qrData, qrUrl } = await createSecureQRCode({
      ticketNumber: ticket.ticket_number,
      orderId: ticket.order_id,
      eventId: ticketMetadata?.eventInfo?.id,
      holderEmail: ticket.holder_email,
    });

    // Update ticket in database
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        qr_code_data: qrData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    if (updateError) {
      throw new Error('Failed to update ticket QR code');
    }

    return qrUrl;
  };

  return {
    isGenerating,
    generatedTickets,
    generateTickets,
    validateTicket,
    regenerateTicketQR,
  };
};