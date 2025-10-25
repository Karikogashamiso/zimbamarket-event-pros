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
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Scan className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Ticket Scanner</h1>
            <p className="text-muted-foreground">
              Paste QR code data below to validate tickets
            </p>
          </div>


          {/* Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder='Paste ticket data here or scan a QR code...'
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>

              {parsedData && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-primary" />
                      Ticket Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Ticket Number - Primary Info */}
                    {parsedData.ticketNumber && (
                      <div className="p-3 bg-background rounded-lg border border-primary/30">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Ticket className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">Ticket Number</p>
                            <p className="font-mono font-semibold text-sm break-all">{parsedData.ticketNumber}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Holder Email */}
                    {parsedData.holderEmail && (
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Ticket Holder</p>
                          <p className="text-sm font-medium break-all">{parsedData.holderEmail}</p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Secondary Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Timestamp */}
                      {parsedData.timestamp && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Issued</p>
                          </div>
                          <p className="text-xs font-medium">
                            {new Date(parsedData.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(parsedData.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      )}

                      {/* Expiry */}
                      {parsedData.expiry && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Expires</p>
                          </div>
                          <p className="text-xs font-medium">
                            {new Date(parsedData.expiry).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(parsedData.expiry).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* IDs Section */}
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reference IDs</p>
                      
                      {parsedData.ticketId && (
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-xs text-muted-foreground">Ticket ID</span>
                          <code className="text-xs font-mono">{parsedData.ticketId.substring(0, 12)}...</code>
                        </div>
                      )}
                      
                      {parsedData.orderId && (
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-xs text-muted-foreground">Order ID</span>
                          <code className="text-xs font-mono">{parsedData.orderId.substring(0, 12)}...</code>
                        </div>
                      )}
                      
                      {parsedData.eventId && parsedData.eventId !== 'general' && (
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-xs text-muted-foreground">Event ID</span>
                          <code className="text-xs font-mono">{parsedData.eventId.substring(0, 12)}...</code>
                        </div>
                      )}
                    </div>

                    {/* Security Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {parsedData.version && (
                        <Badge variant="secondary" className="text-xs">
                          Version {parsedData.version}
                        </Badge>
                      )}
                      {parsedData.format === 'legacy' && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                          Legacy Format
                        </Badge>
                      )}
                      {parsedData.hash && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Signed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => handleValidate()}
                  disabled={isValidating || !qrData.trim()}
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validate Ticket
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Result */}
          {validationResult && (
            <Card className={validationResult.valid ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-600">Valid Ticket</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-600">Invalid Ticket</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResult.valid ? (
                  <>
                    {/* QR Code Display */}
                    {validationResult.ticket.qr_code_url && (
                      <div className="flex justify-center p-4 bg-white rounded-lg border">
                        <img 
                          src={validationResult.ticket.qr_code_url} 
                          alt="Ticket QR Code" 
                          className="w-32 h-32"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Ticket Number:</strong> {validationResult.ticket.number}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Holder:</strong> {validationResult.ticket.holder_name}
                        </span>
                      </div>

                      {validationResult.ticket.holder_email && (
                        <div className="text-sm">
                          <strong>Email:</strong> {validationResult.ticket.holder_email}
                        </div>
                      )}

                      {validationResult.ticket.holder_phone && (
                        <div className="text-sm">
                          <strong>Phone:</strong> {validationResult.ticket.holder_phone}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Event:</strong> {validationResult.ticket.event}
                        </span>
                      </div>

                      {validationResult.ticket.event_date && (
                        <div className="text-sm">
                          <strong>Date:</strong> {new Date(validationResult.ticket.event_date).toLocaleString()}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Seat/Type:</strong> {validationResult.ticket.seat}
                        </span>
                      </div>

                      {validationResult.ticket.type && (
                        <div className="text-sm">
                          <strong>Ticket Type:</strong> {validationResult.ticket.type}
                        </div>
                      )}

                      {validationResult.ticket.price && (
                        <div className="text-sm">
                          <strong>Price:</strong> {validationResult.ticket.currency} {validationResult.ticket.price}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Signature Valid:</span>
                      <Badge variant={validationResult.signatureValid ? "default" : "destructive"}>
                        {validationResult.signatureValid ? 'Yes' : 'No'}
                      </Badge>
                    </div>

                    {validationResult.deviceRisk > 50 && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Medium risk device detected (Score: {validationResult.deviceRisk})
                        </span>
                      </div>
                    )}

                    <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-800">✓ Ticket Entry Approved</p>
                      <p className="text-xs text-green-700 mt-1">
                        This validation has been recorded in the system
                      </p>
                    </div>

                    {validationResult.ticket?.id && (
                      <Button 
                        asChild 
                        className="w-full"
                        variant="default"
                      >
                        <Link to={`/ticket-detail/${validationResult.ticket.id}`}>
                          <Ticket className="w-4 h-4 mr-2" />
                          View Full Ticket Details
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-red-100 rounded-lg border border-red-200">
                      <p className="font-semibold text-red-800 mb-1">Validation Failed</p>
                      <p className="text-sm text-red-700">{validationResult.reason}</p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p><strong>Possible reasons:</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Ticket has already been scanned</li>
                        <li>Ticket has been cancelled or refunded</li>
                        <li>Invalid or tampered QR code</li>
                        <li>Ticket has expired</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Scan the QR code with your phone camera</li>
                <li>The browser will open automatically with the ticket data</li>
                <li>Validation happens automatically</li>
                <li>Or manually paste QR code JSON data in the text area above</li>
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
