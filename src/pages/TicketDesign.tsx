import React from 'react';
import { TicketGenerator } from '@/components/Tickets/TicketGenerator';
import { TicketPreview } from '@/components/Tickets/TicketPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Mail, Download, Share2, Palette } from 'lucide-react';

export default function TicketDesign() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Modern Ticket Templates</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Professional digital tickets with QR codes, optimized for email and WhatsApp delivery across Zimbabwe
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="flex items-center gap-1">
              <QrCode className="h-3 w-3" />
              QR Codes
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile Optimized
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email Ready
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              PDF Export
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              WhatsApp Share
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <TicketGenerator ticketData={{}} />
          </TabsContent>

          <TabsContent value="preview">
            <TicketPreview />
          </TabsContent>

          <TabsContent value="features">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Ticket Solution</CardTitle>
                  <p className="text-muted-foreground">
                    Everything you need for professional ticket delivery in Zimbabwe
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* QR Code Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Smart QR Codes</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Offline validation support</li>
                        <li>• Encrypted ticket data</li>
                        <li>• Anti-fraud protection</li>
                        <li>• High contrast design</li>
                        <li>• Multiple scan formats</li>
                      </ul>
                    </div>

                    {/* Mobile Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Mobile First</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• WhatsApp optimized images</li>
                        <li>• Touch-friendly design</li>
                        <li>• Fast loading graphics</li>
                        <li>• Offline accessibility</li>
                        <li>• Battery efficient</li>
                      </ul>
                    </div>

                    {/* Delivery Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Multi-Channel</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Email PDF attachments</li>
                        <li>• WhatsApp image sharing</li>
                        <li>• SMS link delivery</li>
                        <li>• Web portal access</li>
                        <li>• Print optimization</li>
                      </ul>
                    </div>

                    {/* Branding Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Custom Branding</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Organizer logo support</li>
                        <li>• Color scheme matching</li>
                        <li>• Template variations</li>
                        <li>• Professional layouts</li>
                        <li>• Zimbabwe localization</li>
                      </ul>
                    </div>

                    {/* Currency Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <h3 className="font-semibold">Local Currency</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• USD, ZWL, RTGS$ support</li>
                        <li>• EcoCash integration</li>
                        <li>• OneMoney compatibility</li>
                        <li>• Mobile money receipts</li>
                        <li>• Tax calculation display</li>
                      </ul>
                    </div>

                    {/* Security Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔒</span>
                        <h3 className="font-semibold">Security</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Unique ticket numbers</li>
                        <li>• Tamper-proof design</li>
                        <li>• Real-time validation</li>
                        <li>• Duplicate protection</li>
                        <li>• Audit trail logging</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Image Specifications</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span className="text-muted-foreground">PNG, JPEG, PDF</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolution:</span>
                          <span className="text-muted-foreground">300 DPI (Print), 72 DPI (Digital)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="text-muted-foreground">400x600px (Standard)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>QR Code:</span>
                          <span className="text-muted-foreground">120x120px minimum</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Delivery Optimization</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>WhatsApp:</span>
                          <span className="text-muted-foreground">&lt; 5MB, Auto-compress</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="text-muted-foreground">PDF + PNG options</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SMS:</span>
                          <span className="text-muted-foreground">Short link + preview</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Print:</span>
                          <span className="text-muted-foreground">A4 compatible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}