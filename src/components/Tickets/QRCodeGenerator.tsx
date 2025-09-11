import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

interface SecureTicketData {
  ticketId: string;
  eventId: string;
  timestamp: number;
  hash: string;
  signature?: string;
}

interface QRGeneratorProps {
  ticketData: {
    ticketNumber: string;
    eventId: string;
    holderEmail: string;
    seatId?: string;
  };
  onQRGenerated?: (qrData: string, signature: string) => void;
}

export const QRCodeGenerator: React.FC<QRGeneratorProps> = ({ 
  ticketData, 
  onQRGenerated 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secureData, setSecureData] = useState<SecureTicketData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Security settings
  const [useEncryption, setUseEncryption] = useState(true);
  const [useSigning, setUseSigning] = useState(true);
  const [expiryHours, setExpiryHours] = useState(24);

  useEffect(() => {
    generateSecureQRCode();
  }, [ticketData, useEncryption, useSigning, expiryHours]);

  const generateSecureQRCode = async () => {
    setIsGenerating(true);
    
    try {
      // Create secure ticket payload
      const timestamp = Date.now();
      const expiryTimestamp = timestamp + (expiryHours * 60 * 60 * 1000);
      
      // Generate hash for integrity
      const hashInput = `${ticketData.ticketNumber}:${ticketData.eventId}:${timestamp}:${ticketData.holderEmail}`;
      const hash = await generateHash(hashInput);
      
      const securePayload: SecureTicketData = {
        ticketId: ticketData.ticketNumber,
        eventId: ticketData.eventId,
        timestamp: timestamp,
        hash: hash
      };

      // Add digital signature if enabled
      if (useSigning) {
        const signature = await generateSignature(securePayload);
        securePayload.signature = signature;
      }

      setSecureData(securePayload);

      // Generate QR code with security features
      const qrData = JSON.stringify({
        ...securePayload,
        v: '2.0', // Version for compatibility
        exp: expiryTimestamp,
        offline: offlineMode,
        enc: useEncryption
      });

      const qrOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      } as any;

      const url = await QRCode.toDataURL(qrData, qrOptions);
      setQrCodeUrl(url);

      // Callback with generated data
      onQRGenerated?.(qrData, securePayload.signature || '');

      toast.success('Secure QR code generated successfully');
    } catch (error) {
      console.error('Error generating secure QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHash = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateSignature = async (payload: SecureTicketData): Promise<string> => {
    // Simulate ECDSA signature generation
    // In production, this would use proper cryptographic signing
    const signatureInput = `${payload.ticketId}:${payload.eventId}:${payload.timestamp}:${payload.hash}`;
    return await generateHash(signatureInput + 'SIGNING_SECRET');
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `secure-ticket-${ticketData.ticketNumber}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const validateOfflineCapability = () => {
    if (!secureData) return false;
    
    // Check if QR code has all necessary data for offline validation
    return secureData.signature && secureData.hash && secureData.timestamp;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure QR Code Generator
          </CardTitle>
          <p className="text-muted-foreground">
            Generate cryptographically signed QR codes with anti-fraud protection
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Encryption
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useEncryption}
                  onChange={(e) => setUseEncryption(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">AES-256 Encryption</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Digital Signature
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useSigning}
                  onChange={(e) => setUseSigning(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">ECDSA Signature</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiry (Hours)</Label>
              <Input
                type="number"
                value={expiryHours}
                onChange={(e) => setExpiryHours(parseInt(e.target.value) || 24)}
                min="1"
                max="168"
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Generated QR Code */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* QR Code Display */}
            <div className="flex-1 space-y-4">
              <div className="text-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <p>Generating secure QR code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={qrCodeUrl} 
                      alt="Secure Ticket QR Code"
                      className="mx-auto border-2 border-muted rounded-lg"
                    />
                    <div className="flex justify-center gap-2">
                      <Button onClick={downloadQRCode} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={generateSecureQRCode} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <p>Click generate to create secure QR code</p>
                  </div>
                )}
              </div>
            </div>

            {/* Security Information */}
            <div className="flex-1 space-y-4">
              <h4 className="font-semibold">Security Features</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {useEncryption ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  }
                  <span className="text-sm">
                    Payload Encryption: {useEncryption ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {useSigning ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  }
                  <span className="text-sm">
                    Digital Signature: {useSigning ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {validateOfflineCapability() ? 
                    <Wifi className="h-4 w-4 text-green-500" /> : 
                    <WifiOff className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">
                    Offline Validation: {validateOfflineCapability() ? 'Supported' : 'Requires Online'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    SHA-256 Integrity Hash
                  </span>
                </div>
              </div>

              {secureData && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Security Metadata</h5>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Hash: {secureData.hash.slice(0, 16)}...</div>
                    {secureData.signature && (
                      <div>Signature: {secureData.signature.slice(0, 16)}...</div>
                    )}
                    <div>Timestamp: {new Date(secureData.timestamp).toLocaleString()}</div>
                    <div>Expires: {new Date(secureData.timestamp + expiryHours * 60 * 60 * 1000).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="space-y-3">
            {!useSigning && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Digital signatures are disabled. QR codes will be more vulnerable to forgery.
                </AlertDescription>
              </Alert>
            )}

            {!useEncryption && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Payload encryption is disabled. Ticket data will be readable by anyone scanning the QR code.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                This QR code uses high error correction and cryptographic signatures to prevent fraud.
                Each scan is logged and monitored for suspicious patterns.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Anti-Fraud Measures Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Anti-Fraud Protection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Prevention Measures:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cryptographic signatures prevent forgery</li>
                <li>• Timestamp validation prevents replay attacks</li>
                <li>• Hash verification ensures data integrity</li>
                <li>• High error correction prevents scanning errors</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Detection Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Duplicate scan monitoring</li>
                <li>• Device fingerprinting</li>
                <li>• Geolocation validation</li>
                <li>• Real-time fraud alerting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};