import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Eye, 
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Smartphone,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FraudAlert {
  id: string;
  alert_type: string;
  entity_type: string;
  entity_id: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  details: any;
  created_at: string;
  fraud_rules?: {
    rule_name: string;
    rule_type: string;
  };
}

interface FraudStats {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  topFraudTypes: Array<{ type: string; count: number }>;
  riskTrends: Array<{ date: string; count: number }>;
}

export const FraudDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  useEffect(() => {
    fetchFraudData();
  }, [selectedTimeframe]);

  const fetchFraudData = async () => {
    try {
      setLoading(true);

      // Fetch fraud alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          fraud_rules(rule_name, rule_type)
        `)
        .gte('created_at', getTimeframeDate(selectedTimeframe).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Fetch fraud statistics via edge function
      const { data: statsResponse, error: statsError } = await supabase.functions.invoke(
        'fraud-monitor/statistics',
        { 
          body: { timeframe: selectedTimeframe }
        }
      );

      if (statsError) throw statsError;
      setStats(statsResponse);

    } catch (error) {
      console.error('Error fetching fraud data:', error);
      toast.error('Failed to load fraud dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeDate = (timeframe: string): Date => {
    const now = new Date();
    switch (timeframe) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const updateAlertStatus = async (alertId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('fraud_alerts')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: newStatus as any }
          : alert
      ));

      toast.success(`Alert ${newStatus}`);
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fraud Detection Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage security threats</p>
        </div>
        
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map(timeframe => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{stats.totalAlerts}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-500">{stats.criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-500">{stats.resolvedAlerts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.totalAlerts > 0 
                      ? Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <Progress 
                value={stats.totalAlerts > 0 ? (stats.resolvedAlerts / stats.totalAlerts) * 100 : 0} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Fraud Patterns</TabsTrigger>
          <TabsTrigger value="devices">Device Analysis</TabsTrigger>
          <TabsTrigger value="rules">Detection Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Threats</h3>
                <p className="text-muted-foreground">
                  All systems are secure. No fraud alerts in the selected timeframe.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getSeverityIcon(alert.severity_level)}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {formatAlertType(alert.alert_type)}
                            </h3>
                            <Badge variant={getSeverityColor(alert.severity_level) as any}>
                              {alert.severity_level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {alert.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {alert.entity_type.charAt(0).toUpperCase() + alert.entity_type.slice(1)}: {alert.entity_id}
                            </p>
                            
                            {alert.details && (
                              <div className="text-sm">
                                {alert.details.device_fingerprint && (
                                  <div className="flex items-center gap-1">
                                    <Smartphone className="h-3 w-3" />
                                    Device: {alert.details.device_fingerprint.slice(0, 16)}...
                                  </div>
                                )}
                                {alert.details.ip_address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    IP: {alert.details.ip_address}
                                  </div>
                                )}
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {alert.status === 'open' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAlertStatus(alert.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAlertStatus(alert.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAlertStatus(alert.id, 'false_positive')}
                          >
                            False Positive
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats?.topFraudTypes && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Fraud Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topFraudTypes.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <span className="text-sm">{formatAlertType(type.type)}</span>
                        <Badge variant="secondary">{type.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Risk Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.riskTrends.map((trend) => (
                    <div key={trend.date} className="flex items-center justify-between text-sm">
                      <span>{trend.date}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(trend.count / 10) * 100} className="w-20 h-2" />
                        <span className="w-8 text-right">{trend.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Device analysis helps identify suspicious patterns and prevent account takeover attempts.
              Monitor devices with high fraud scores or unusual activity patterns.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="rules">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Fraud detection rules automatically monitor transactions and user behavior.
              Configure thresholds and actions to balance security with user experience.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};