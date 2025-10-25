import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Scan, AlertTriangle, User, Calendar, MapPin, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MetaTags from '@/components/SEO/MetaTags';

export const ScanTicket: React.FC = () => {
  const [qrData, setQrData] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidate = async () => {
    if (!qrData.trim()) {
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
          qrCodeData: qrData,
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
      return JSON.parse(data);
    } catch {
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
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">QR Code Data</label>
                <Textarea
                  placeholder='Paste QR code JSON data here... Example: {"ticketId":"ZEP-12345678-...","orderId":"...","eventId":"...","timestamp":...}'
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>

              {parsedData && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Parsed Data:</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Ticket ID:</strong> {parsedData.ticketId}</p>
                    <p><strong>Event ID:</strong> {parsedData.eventId}</p>
                    <p><strong>Timestamp:</strong> {new Date(parsedData.timestamp).toLocaleString()}</p>
                    {parsedData.expiry && (
                      <p><strong>Expires:</strong> {new Date(parsedData.expiry).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleValidate}
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

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Event:</strong> {validationResult.ticket.event}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Seat/Type:</strong> {validationResult.ticket.seat}
                        </span>
                      </div>
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
                <li>Have the attendee show their ticket QR code</li>
                <li>The QR code data is a JSON string - copy it</li>
                <li>Paste the data in the text area above</li>
                <li>Click "Validate Ticket" to verify</li>
                <li>Check the validation result</li>
              </ol>
              <p className="text-xs text-blue-600 mt-3">
                <strong>Note:</strong> Each ticket can only be scanned once within a 5-minute window
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
