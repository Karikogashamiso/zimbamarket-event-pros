import React, { useState } from 'react';
import { TicketTemplate } from './TicketTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Smartphone, Monitor, Printer, Mail, MessageCircle } from 'lucide-react';

export const TicketPreview: React.FC = () => {
  const [showSeats, setShowSeats] = useState(true);
  const [ticketVariant, setTicketVariant] = useState<'standard' | 'premium' | 'compact'>('standard');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'email' | 'whatsapp'>('desktop');

  const mockTicket = {
    ticketNumber: 'ZEP-2024-001234',
    eventTitle: 'Zimbabwe Fashion Week 2024',
    eventType: 'event' as const,
    dateTime: '2024-12-15T18:30:00',
    venue: 'Harare International Conference Centre',
    location: 'Harare, Zimbabwe',
    customerName: 'Chipo Mutasa',
    ticketType: 'Premium',
    price: 75,
    currency: 'USD',
    seatInfo: showSeats ? {
      row: 'B',
      seat: '8',
      section: 'Premium'
    } : undefined,
    qrCodeData: JSON.stringify({
      ticketId: 'ZEP-2024-001234',
      eventId: 'zfw_2024',
      timestamp: Date.now(),
      hash: 'zfw2024abc123'
    }),
    organizerName: 'ZimEventPro',
    specialInstructions: 'Smart casual dress code required',
    gateInfo: 'Main Entrance'
  };

  const getPreviewStyles = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto bg-black p-4 rounded-2xl';
      case 'email':
        return 'max-w-2xl mx-auto bg-gray-100 p-8 rounded-lg';
      case 'whatsapp':
        return 'max-w-sm mx-auto bg-green-50 p-3 rounded-lg border-2 border-green-200';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const getPreviewLabel = () => {
    switch (previewMode) {
      case 'mobile':
        return '📱 Mobile View';
      case 'email':
        return '📧 Email Preview';
      case 'whatsapp':
        return '💬 WhatsApp Preview';
      default:
        return '🖥️ Desktop View';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Design Preview</CardTitle>
          <p className="text-muted-foreground">
            Preview how tickets will appear across different platforms and devices
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-seats"
                    checked={showSeats}
                    onCheckedChange={setShowSeats}
                  />
                  <Label htmlFor="show-seats">Show Seat Assignment</Label>
                </div>

                <div className="flex gap-2">
                  {(['standard', 'premium', 'compact'] as const).map((variant) => (
                    <Button
                      key={variant}
                      variant={ticketVariant === variant ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTicketVariant(variant)}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preview Container */}
              <div className="border rounded-lg p-6 bg-muted/30">
                <div className="text-center mb-4">
                  <Badge variant="secondary">{getPreviewLabel()}</Badge>
                </div>
                
                <div className={getPreviewStyles()}>
                  {previewMode === 'email' && (
                    <div className="mb-4 p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>From:</strong> noreply@zimeventpro.co.zw
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Subject:</strong> Your {mockTicket.eventTitle} Ticket
                      </div>
                      <div className="text-sm text-gray-800">
                        Dear {mockTicket.customerName}, your ticket is attached below:
                      </div>
                    </div>
                  )}

                  {previewMode === 'whatsapp' && (
                    <div className="mb-3 text-sm bg-white p-3 rounded-lg">
                      <div className="font-medium text-green-600 mb-1">ZimEventPro</div>
                      <div className="text-gray-800">
                        🎟️ Your {mockTicket.eventTitle} ticket is ready! 
                        Please save this image or screenshot for entry.
                      </div>
                    </div>
                  )}

                  <TicketTemplate
                    ticket={mockTicket}
                    variant={ticketVariant}
                    showDownloadButton={previewMode === 'desktop'}
                  />

                  {previewMode === 'mobile' && (
                    <div className="mt-3 text-center text-xs text-white/70">
                      iPhone 14 Pro Preview
                    </div>
                  )}
                </div>
              </div>

              {/* Platform-Specific Guidelines */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">
                    {previewMode === 'whatsapp' && '💬 WhatsApp Optimization'}
                    {previewMode === 'email' && '📧 Email Delivery'}
                    {previewMode === 'mobile' && '📱 Mobile Experience'}
                    {previewMode === 'desktop' && '🖥️ Desktop Features'}
                  </h4>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    {previewMode === 'whatsapp' && (
                      <ul className="space-y-1">
                        <li>• Image automatically compressed for fast sending</li>
                        <li>• QR code remains scannable at small sizes</li>
                        <li>• Text sized for mobile readability</li>
                        <li>• Works offline once downloaded</li>
                      </ul>
                    )}
                    
                    {previewMode === 'email' && (
                      <ul className="space-y-1">
                        <li>• PDF and PNG formats available</li>
                        <li>• Consistent rendering across email clients</li>
                        <li>• Print-friendly design and colors</li>
                        <li>• Professional branding maintained</li>
                      </ul>
                    )}

                    {previewMode === 'mobile' && (
                      <ul className="space-y-1">
                        <li>• Optimized for 375px mobile screens</li>
                        <li>• Touch-friendly interactive elements</li>
                        <li>• High contrast for outdoor visibility</li>
                        <li>• Battery-efficient dark mode support</li>
                      </ul>
                    )}

                    {previewMode === 'desktop' && (
                      <ul className="space-y-1">
                        <li>• Full-resolution QR codes for printing</li>
                        <li>• Download options (PDF, PNG)</li>
                        <li>• Share functionality built-in</li>
                        <li>• Detailed event information display</li>
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};