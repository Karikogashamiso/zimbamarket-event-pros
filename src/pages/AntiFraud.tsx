import React from 'react';
import { FraudDashboard } from '@/components/Admin/FraudDashboard';
import { QRCodeGenerator } from '@/components/Tickets/QRCodeGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  Lock, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Smartphone,
  Globe
} from 'lucide-react';

export default function AntiFraud() {
  const sampleTicketData = {
    ticketNumber: 'ZEP-2024-001234',
    eventId: 'evt_zim_fashion_week_2024',
    holderEmail: 'customer@example.com',
    seatId: 'A12'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Anti-Fraud Security Center</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            Comprehensive fraud detection and prevention system for ZimEventPro, featuring signed QR codes, 
            duplicate scan prevention, suspicious purchase monitoring, and offline validation capabilities.
          </p>
          
          {/* Security Status Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Crypto Signatures
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Real-time Monitoring
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Offline Validation
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              ML Detection
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="qr-security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              QR Security
            </TabsTrigger>
            <TabsTrigger value="prevention" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Prevention
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <FraudDashboard />
          </TabsContent>

          <TabsContent value="qr-security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Secure QR Code Generation</CardTitle>
                  <p className="text-muted-foreground">
                    Generate cryptographically signed QR codes with built-in anti-fraud protection
                  </p>
                </CardHeader>
              </Card>
              
              <QRCodeGenerator 
                ticketData={sampleTicketData}
                onQRGenerated={(data, signature) => {
                  console.log('QR Generated:', { data, signature });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="prevention">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duplicate Scan Prevention */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      Duplicate Scan Prevention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Automatic detection of duplicate scans within 5-minute windows
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Detection Methods:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Database triggers monitor all scan attempts</li>
                        <li>• Device fingerprinting tracks scanning devices</li>
                        <li>• IP address correlation prevents network abuse</li>
                        <li>• GPS location validation for venue entry</li>
                        <li>• Real-time alerts for suspicious patterns</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-3 rounded">
                      <div className="text-sm">
                        <strong>Current Protection Level:</strong> 
                        <Badge variant="secondary" className="ml-2">Advanced</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Blocks 99.8% of duplicate scanning attempts
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Monitoring */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      Purchase Pattern Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ML-powered analysis of purchase velocity and behavior patterns
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Risk Factors Monitored:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Purchase velocity (orders per hour)</li>
                        <li>• Large quantity transactions</li>
                        <li>• Suspicious personal information patterns</li>
                        <li>• Payment method risk analysis</li>
                        <li>• Geographic anomaly detection</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">0-40</div>
                        <div className="text-xs text-green-600">Low Risk</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-lg font-bold text-yellow-600">41-70</div>
                        <div className="text-xs text-yellow-600">Medium Risk</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-lg font-bold text-red-600">71-100</div>
                        <div className="text-xs text-red-600">High Risk</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Fingerprinting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-purple-500" />
                      Device Fingerprinting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Advanced device tracking without violating user privacy
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Tracked Attributes:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Browser fingerprint (canvas, WebGL)</li>
                        <li>• Screen resolution and color depth</li>
                        <li>• Timezone and language settings</li>
                        <li>• Hardware specifications</li>
                        <li>• Network characteristics</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm font-medium text-blue-800">Privacy Compliant</div>
                      <div className="text-xs text-blue-600 mt-1">
                        No personal data stored, only behavioral hashes
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Offline Validation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-orange-500" />
                      Offline Validation System
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Secure validation without internet connectivity for remote venues
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Offline Capabilities:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Pre-downloaded signing keys</li>
                        <li>• Local signature verification</li>
                        <li>• Cached blacklist checking</li>
                        <li>• Sync upon reconnection</li>
                        <li>• Conflict resolution protocols</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                      <span className="text-sm font-medium">Offline Security Level:</span>
                      <Badge variant="secondary">98.5% Accurate</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Anti-Fraud Strategy</CardTitle>
                  <p className="text-muted-foreground">
                    Multi-layered approach to fraud prevention and detection for Zimbabwe's event industry
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Strategy Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Prevention</h3>
                        <p className="text-sm text-muted-foreground">
                          Stop fraud before it happens with cryptographic security
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Detection</h3>
                        <p className="text-sm text-muted-foreground">
                          Real-time monitoring and pattern analysis
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Response</h3>
                        <p className="text-sm text-muted-foreground">
                          Automated alerts and manual review processes
                        </p>
                      </div>
                    </div>

                    {/* Zimbabwe-Specific Considerations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Zimbabwe Market Adaptations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Local Challenges:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• Intermittent internet connectivity</li>
                              <li>• Multiple currency systems</li>
                              <li>• Limited banking infrastructure</li>
                              <li>• Mobile-first user base</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Our Solutions:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• Robust offline validation</li>
                              <li>• EcoCash/OneMoney integration</li>
                              <li>• WhatsApp delivery optimization</li>
                              <li>• Low-bandwidth QR codes</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Implementation Roadmap */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Security Implementation Levels</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Level 1: Basic Protection (Implemented)</div>
                              <div className="text-sm text-muted-foreground">
                                QR code signing, duplicate detection, basic monitoring
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">Level 2: Advanced Analytics (Active)</div>
                              <div className="text-sm text-muted-foreground">
                                ML pattern detection, risk scoring, device fingerprinting
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <div>
                              <div className="font-medium">Level 3: Enterprise Security (Planned)</div>
                              <div className="text-sm text-muted-foreground">
                                Blockchain verification, biometric validation, AI-powered fraud detection
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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