import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FraudAnalysisRequest {
  orderId?: string;
  userId?: string;
  timeframe?: string; // '24h', '7d', '30d'
  riskThreshold?: number;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function analyzePurchaseVelocity(email: string, timeframe: string = '1h'): Promise<{
  count: number;
  totalAmount: number;
  riskScore: number;
}> {
  const timeframeMap = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days'
  };

  const interval = timeframeMap[timeframe as keyof typeof timeframeMap] || '1 hour';

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('customer_email', email)
    .gte('created_at', new Date(Date.now() - getMilliseconds(interval)).toISOString());

  if (error) {
    console.error('Error analyzing velocity:', error);
    return { count: 0, totalAmount: 0, riskScore: 0 };
  }

  const count = data?.length || 0;
  const totalAmount = data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  
  let riskScore = 0;
  if (timeframe === '1h') {
    if (count > 5) riskScore += 40;
    else if (count > 3) riskScore += 25;
    else if (count > 1) riskScore += 10;
  } else if (timeframe === '24h') {
    if (count > 20) riskScore += 30;
    else if (count > 10) riskScore += 15;
  }

  if (totalAmount > 5000) riskScore += 20;
  else if (totalAmount > 2000) riskScore += 10;

  return { count, totalAmount, riskScore };
}

function getMilliseconds(interval: string): number {
  const map = {
    '1 hour': 60 * 60 * 1000,
    '24 hours': 24 * 60 * 60 * 1000,
    '7 days': 7 * 24 * 60 * 60 * 1000,
    '30 days': 30 * 24 * 60 * 60 * 1000
  };
  return map[interval as keyof typeof map] || 60 * 60 * 1000;
}

async function analyzeDevicePatterns(deviceFingerprint: string): Promise<{
  orderCount: number;
  fraudScore: number;
  isBlocked: boolean;
  suspiciousActivity: string[];
}> {
  const { data: device, error } = await supabase
    .from('device_fingerprints')
    .select('*')
    .eq('fingerprint_hash', deviceFingerprint)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error analyzing device:', error);
    return { orderCount: 0, fraudScore: 0, isBlocked: false, suspiciousActivity: [] };
  }

  if (!device) {
    return { orderCount: 0, fraudScore: 0, isBlocked: false, suspiciousActivity: [] };
  }

  const suspiciousActivity: string[] = [];
  
  if (device.order_count > 50) {
    suspiciousActivity.push('High order volume from single device');
  }
  
  if (device.fraud_score > 70) {
    suspiciousActivity.push('Previously flagged for suspicious activity');
  }

  return {
    orderCount: device.order_count || 0,
    fraudScore: device.fraud_score || 0,
    isBlocked: device.is_blocked || false,
    suspiciousActivity
  };
}

async function getRecentFraudAlerts(timeframe: string = '24h'): Promise<any[]> {
  const interval = getMilliseconds(timeframe === '24h' ? '24 hours' : '7 days');
  
  const { data, error } = await supabase
    .from('fraud_alerts')
    .select(`
      *,
      fraud_rules(rule_name, rule_type)
    `)
    .gte('created_at', new Date(Date.now() - interval).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching fraud alerts:', error);
    return [];
  }

  return data || [];
}

async function getFraudStatistics(timeframe: string = '7d'): Promise<{
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  topFraudTypes: Array<{ type: string; count: number }>;
  riskTrends: Array<{ date: string; count: number }>;
}> {
  const interval = getMilliseconds(timeframe === '7d' ? '7 days' : '30 days');
  
  const { data: alerts, error } = await supabase
    .from('fraud_alerts')
    .select('alert_type, severity_level, status, created_at')
    .gte('created_at', new Date(Date.now() - interval).toISOString());

  if (error) {
    console.error('Error fetching fraud statistics:', error);
    return { 
      totalAlerts: 0, 
      criticalAlerts: 0, 
      resolvedAlerts: 0, 
      topFraudTypes: [], 
      riskTrends: [] 
    };
  }

  const totalAlerts = alerts?.length || 0;
  const criticalAlerts = alerts?.filter(a => a.severity_level === 'critical').length || 0;
  const resolvedAlerts = alerts?.filter(a => a.status === 'resolved').length || 0;

  // Count fraud types
  const fraudTypeCounts: Record<string, number> = {};
  alerts?.forEach(alert => {
    fraudTypeCounts[alert.alert_type] = (fraudTypeCounts[alert.alert_type] || 0) + 1;
  });

  const topFraudTypes = Object.entries(fraudTypeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate daily trends for the last 7 days
  const riskTrends: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayAlerts = alerts?.filter(alert => {
      const alertDate = new Date(alert.created_at);
      return alertDate >= dayStart && alertDate <= dayEnd;
    }).length || 0;

    riskTrends.push({
      date: dayStart.toISOString().split('T')[0],
      count: dayAlerts
    });
  }

  return { totalAlerts, criticalAlerts, resolvedAlerts, topFraudTypes, riskTrends };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'analyze-purchase': {
        const { orderId, timeframe = '1h' }: FraudAnalysisRequest = await req.json();
        
        if (!orderId) {
          return new Response('Order ID required', { status: 400, headers: corsHeaders });
        }

        // Get order details
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error || !order) {
          return new Response('Order not found', { status: 404, headers: corsHeaders });
        }

        // Analyze purchase velocity
        const velocityAnalysis = await analyzePurchaseVelocity(order.customer_email, timeframe);
        
        // Calculate overall risk score using the database function
        const { data: riskData, error: riskError } = await supabase
          .rpc('calculate_risk_score', { order_uuid: orderId });

        const riskScore = riskError ? 0 : (riskData || 0);

        return new Response(
          JSON.stringify({
            order: order,
            riskScore: riskScore,
            velocityAnalysis: velocityAnalysis,
            recommendations: getRiskRecommendations(riskScore)
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      case 'device-analysis': {
        const { deviceFingerprint } = await req.json();
        
        if (!deviceFingerprint) {
          return new Response('Device fingerprint required', { status: 400, headers: corsHeaders });
        }

        const deviceAnalysis = await analyzeDevicePatterns(deviceFingerprint);

        return new Response(
          JSON.stringify(deviceAnalysis),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      case 'alerts': {
        const timeframe = url.searchParams.get('timeframe') || '24h';
        const alerts = await getRecentFraudAlerts(timeframe);

        return new Response(
          JSON.stringify({ alerts }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      case 'statistics': {
        const timeframe = url.searchParams.get('timeframe') || '7d';
        const stats = await getFraudStatistics(timeframe);

        return new Response(
          JSON.stringify(stats),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      default:
        return new Response('Invalid action', { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Fraud monitor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

function getRiskRecommendations(riskScore: number): string[] {
  const recommendations: string[] = [];

  if (riskScore > 80) {
    recommendations.push('BLOCK: High risk transaction - manual review required');
    recommendations.push('Verify customer identity through additional channels');
    recommendations.push('Check for previous fraud reports');
  } else if (riskScore > 60) {
    recommendations.push('REVIEW: Medium-high risk - additional verification recommended');
    recommendations.push('Monitor for suspicious patterns');
    recommendations.push('Consider delayed fulfillment');
  } else if (riskScore > 40) {
    recommendations.push('MONITOR: Medium risk - watch for patterns');
    recommendations.push('Standard processing with enhanced monitoring');
  } else {
    recommendations.push('APPROVE: Low risk transaction');
    recommendations.push('Standard processing');
  }

  return recommendations;
}

serve(handler);