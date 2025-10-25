import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, CheckCircle, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';

export const TestQRCode: React.FC = () => {
  const [testQRUrl, setTestQRUrl] = useState('');
  const [testData, setTestData] = useState('');
  const [urlLength, setUrlLength] = useState(0);

  useEffect(() => {
    generateTestQR();
  }, []);

  const generateTestQR = async () => {
    try {
      // Create a simple test ticket
      const simpleTicketData = {
        ticketId: 'TEST-12345678',
        orderId: 'ORD-TEST-001',
        eventId: 'EVT-001',
        timestamp: Date.now(),
      };

      const jsonData = JSON.stringify(simpleTicketData);
      const encodedData = btoa(jsonData);
      const origin = window.location.origin;
      const scanUrl = `${origin}/scan-ticket?ticket=${encodedData}`;

      setTestData(jsonData);
      setUrlLength(scanUrl.length);

      console.log('=== Test QR Code ===');
      console.log('Raw data:', jsonData);
      console.log('Encoded data:', encodedData);
      console.log('Full URL:', scanUrl);
      console.log('URL length:', scanUrl.length);

      const qrUrl = await QRCode.toDataURL(scanUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setTestQRUrl(qrUrl);
      console.log('✅ Test QR code generated');
    } catch (error) {
      console.error('❌ Test QR generation failed:', error);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'test-qr-code.png';
    link.href = testQRUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Test & Debugging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <Alert>
              <AlertDescription>
                <strong>How to test:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Download the QR code using the button below</li>
                  <li>Display it on your computer screen</li>
                  <li>Scan it with your phone camera</li>
                  <li>Your phone should open the /scan-ticket page automatically</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* QR Code Display */}
            {testQRUrl && (
              <div className="space-y-4">
                <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed">
                  <img 
                    src={testQRUrl} 
                    alt="Test QR Code" 
                    className="w-80 h-80"
                  />
                </div>

                <Button 
                  onClick={downloadQR}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Test QR Code
                </Button>
              </div>
            )}

            {/* Debug Info */}
            <Card className="bg-muted">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold">Debug Information</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    {urlLength < 500 ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">URL Length: {urlLength} characters</p>
                      <p className="text-xs text-muted-foreground">
                        {urlLength < 500 && 'Optimal length for scanning'}
                        {urlLength >= 500 && urlLength < 1000 && 'Acceptable length, should work'}
                        {urlLength >= 1000 && 'Long URL, might have scanning issues'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-1">Ticket Data:</p>
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                      {testData}
                    </pre>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Expected Scan URL:</p>
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto break-all">
                      {window.location.origin}/scan-ticket?ticket=[BASE64_DATA]
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Troubleshooting QR Codes</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Make sure your phone camera has QR code scanning enabled</li>
                  <li>Try scanning from different distances (6-12 inches usually works best)</li>
                  <li>Ensure good lighting - avoid glare on the screen</li>
                  <li>If your camera doesn't detect it, try a dedicated QR scanner app</li>
                  <li>Make sure the QR code is displayed clearly without pixelation</li>
                  <li>Check that your phone has internet connection</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Separator = () => <div className="border-t" />;
