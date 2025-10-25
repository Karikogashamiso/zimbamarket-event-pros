import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Scan, AlertTriangle, User, Calendar, MapPin, Ticket, Camera, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MetaTags from '@/components/SEO/MetaTags';
import { Html5Qrcode } from 'html5-qrcode';

export const ScanTicket: React.FC = () => {
  const [qrData, setQrData] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  const handleValidate = async (dataToValidate?: string) => {
    const data = dataToValidate || qrData;
    
    if (!data.trim()) {
      toast.error('Please scan or paste QR code data');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Generate device fingerprint
      const deviceFingerprint = await generateDeviceFingerprint();

      const { data: result, error } = await supabase.functions.invoke('validate-ticket', {
        body: {
          qrCodeData: data,
          deviceFingerprint: deviceFingerprint,
          validationType: 'scan',
        },
      });

      if (error) {
        throw error;
      }

      setValidationResult(result);

      if (result.valid) {
        toast.success('Ticket validated successfully!');
      } else {
        toast.error(`Validation failed: ${result.reason}`);
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

  const startScanner = async () => {
    setScanError('');
    setIsScanning(true);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerDivId);
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );
    } catch (err: any) {
      console.error('Scanner error:', err);
      setScanError(`Failed to start scanner: ${err.message || 'Camera access denied'}`);
      setIsScanning(false);
      toast.error('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
    setQrData(decodedText);
    stopScanner();
    toast.success('QR Code scanned successfully!');
    // Auto-validate after successful scan
    setTimeout(() => handleValidate(decodedText), 500);
  };

  const onScanError = (errorMessage: string) => {
    // Ignore frequent scanning errors, only log
    if (!errorMessage.includes('NotFoundException')) {
      console.warn('QR scan error:', errorMessage);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleClear = () => {
    setQrData('');
    setValidationResult(null);
    setScanError('');
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

          {/* Scanner Card with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Validate Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="camera" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="camera">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan with Camera
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <FileText className="w-4 h-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="space-y-4">
                  <div className="space-y-3">
                    <div id={scannerDivId} className={`w-full rounded-lg overflow-hidden border-2 ${isScanning ? 'border-primary' : 'border-muted'}`} />
                    
                    {scanError && (
                      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <p className="text-sm text-destructive">{scanError}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {!isScanning ? (
                        <Button onClick={startScanner} className="flex-1">
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      ) : (
                        <Button onClick={stopScanner} variant="outline" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Stop Camera
                        </Button>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Hold the QR code steady in front of your camera. The ticket will be automatically validated once scanned.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
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
                </TabsContent>
              </Tabs>
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
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Camera Scanning:</p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                    <li>Click "Start Camera" to activate your device camera</li>
                    <li>Point your camera at the ticket's QR code</li>
                    <li>The ticket will be automatically validated once scanned</li>
                  </ol>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Manual Entry:</p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                    <li>Have the attendee show their ticket QR code</li>
                    <li>Copy the QR code data (JSON string)</li>
                    <li>Paste in the text area and click "Validate Ticket"</li>
                  </ol>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">
                <strong>Note:</strong> Each ticket can only be scanned once within a 5-minute window to prevent duplicate entries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
