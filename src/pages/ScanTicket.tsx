import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Scan, AlertTriangle, User, Calendar, MapPin, Ticket, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MetaTags from '@/components/SEO/MetaTags';

export const ScanTicket: React.FC = () => {
  const [qrData, setQrData] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Check for ticket parameter in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    
    console.log('URL Params:', window.location.search);
    console.log('Ticket Parameter:', ticketParam);
    
    if (ticketParam) {
      try {
        // Decode base64 data
        const decodedData = atob(ticketParam);
        console.log('=== Scan Detection Debug ===');
        console.log('Decoded Data:', decodedData);
        
        setDebugInfo(`Received ticket parameter\nDecoded ${decodedData.length} characters`);
        setQrData(decodedData);
        
        // Verify it's valid JSON
        try {
          const parsed = JSON.parse(decodedData);
          console.log('Parsed JSON:', parsed);
          console.log('Ticket ID:', parsed.ticketId);
          console.log('Ticket Number:', parsed.ticketNumber);
          setDebugInfo(prev => prev + '\n✅ Valid JSON detected\n' + JSON.stringify(parsed, null, 2));
          
          // Auto-validate when coming from QR scan
          setTimeout(() => handleValidate(decodedData), 500);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setDebugInfo(prev => prev + '\n❌ Error: Not valid JSON');
          toast.error('Invalid ticket format - not valid JSON');
        }
      } catch (error) {
        console.error('Failed to decode ticket data:', error);
        setDebugInfo(`❌ Decode error: ${error}`);
        toast.error('Invalid ticket data in URL - failed to decode');
      }
    } else {
      setDebugInfo('No ticket parameter found in URL');
    }
  }, []);

  const handleValidate = async (dataToValidate?: string) => {
    const dataToUse = dataToValidate || qrData;
    
    if (!dataToUse.trim()) {
      toast.error('Please paste QR code data');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Generate device fingerprint
      const deviceFingerprint = await generateDeviceFingerprint();

      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: {
          qrCodeData: dataToUse,
          deviceFingerprint: deviceFingerprint,
          validationType: 'manual',
        },
      });

      if (error) {
        throw error;
      }

      setValidationResult(data);

      if (data.valid) {
        toast.success('Ticket validated successfully!');
      } else {
        toast.error(`Validation failed: ${data.reason}`);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error(`Validation error: ${error.message}`);
      setValidationResult({
        valid: false,
        reason: error.message || 'Unknown error occurred',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const generateDeviceFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Browser Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Browser Fingerprint', 4, 17);
    }
    
    const fingerprint = canvas.toDataURL();
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint + navigator.userAgent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleClear = () => {
    setQrData('');
    setValidationResult(null);
  };

  const parseQRData = (data: string) => {
    try {
      // Try parsing as JSON first (new format)
      return JSON.parse(data);
    } catch {
      // Try parsing old colon-separated format: ticketId:orderId:ticketNumber
      if (data.includes(':')) {
        const parts = data.split(':');
        if (parts.length >= 3) {
          return {
            ticketId: parts[0],
            orderId: parts[1],
            ticketNumber: parts[2],
            version: '1.0',
            format: 'legacy'
          };
        }
      }
      return null;
    }
  };

  const parsedData = parseQRData(qrData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <MetaTags
        title="Scan Ticket - ZimEventPro"
        description="Validate event tickets using QR codes"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Scan the QR code with your phone camera</li>
                <li>The browser will open automatically with the ticket data</li>
                <li>Validation happens automatically</li>
              </ol>
              <p className="text-xs text-blue-600 mt-3">
                <strong>Note:</strong> Each ticket can only be scanned once within a 5-minute window
              </p>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Current URL:</strong> {window.location.href}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
