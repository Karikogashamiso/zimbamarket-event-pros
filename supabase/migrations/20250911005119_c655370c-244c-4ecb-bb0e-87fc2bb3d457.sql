-- Anti-fraud system tables

-- Fraud detection rules and patterns
CREATE TABLE public.fraud_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'purchase_velocity', 'duplicate_scan', 'suspicious_pattern', 'geolocation'
  parameters JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  severity_level TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  action_type TEXT NOT NULL DEFAULT 'flag', -- 'flag', 'block', 'require_verification'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fraud alerts and incidents
CREATE TABLE public.fraud_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'suspicious_purchase', 'duplicate_scan', 'invalid_signature', 'velocity_exceeded'
  entity_type TEXT NOT NULL, -- 'order', 'ticket', 'user', 'device'
  entity_id UUID NOT NULL,
  rule_id UUID REFERENCES public.fraud_rules(id),
  severity_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  details JSONB NOT NULL DEFAULT '{}',
  resolved_by_user_id UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket validation history and duplicate tracking
CREATE TABLE public.ticket_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id),
  validation_type TEXT NOT NULL, -- 'scan', 'manual', 'api'
  validation_result TEXT NOT NULL, -- 'valid', 'invalid', 'duplicate', 'expired', 'fraud'
  validator_user_id UUID,
  device_fingerprint TEXT,
  ip_address INET,
  location_data JSONB DEFAULT '{}',
  signature_verification BOOLEAN DEFAULT false,
  offline_validation BOOLEAN DEFAULT false,
  validation_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase pattern analysis and risk scoring
CREATE TABLE public.purchase_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  risk_score INTEGER NOT NULL DEFAULT 0, -- 0-100 scale
  risk_factors JSONB NOT NULL DEFAULT '[]',
  velocity_flags JSONB DEFAULT '{}',
  device_analysis JSONB DEFAULT '{}',
  geolocation_analysis JSONB DEFAULT '{}',
  payment_analysis JSONB DEFAULT '{}',
  manual_review_required BOOLEAN DEFAULT false,
  approved_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Device fingerprinting for fraud detection
CREATE TABLE public.device_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint_hash TEXT NOT NULL UNIQUE,
  device_info JSONB NOT NULL DEFAULT '{}',
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_count INTEGER DEFAULT 0,
  fraud_score INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QR code signing keys and validation
CREATE TABLE public.qr_signing_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  private_key_hash TEXT NOT NULL, -- Hashed, never store actual private key
  algorithm TEXT NOT NULL DEFAULT 'ECDSA',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all fraud tables
ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_signing_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fraud management (Admin and staff access)
CREATE POLICY "Admins can manage fraud rules" ON public.fraud_rules
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and staff can view fraud alerts" ON public.fraud_alerts
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (entity_id IN (
    SELECT DISTINCT t.id FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    JOIN events e ON tt.event_id = e.id
    JOIN organizers o ON e.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  ))
);

CREATE POLICY "Staff can create validation records" ON public.ticket_validations
FOR INSERT WITH CHECK (validator_user_id = auth.uid());

CREATE POLICY "Staff can view validations for their events" ON public.ticket_validations
FOR SELECT USING (
  ticket_id IN (
    SELECT t.id FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    JOIN events e ON tt.event_id = e.id
    JOIN organizers o ON e.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage risk scores" ON public.purchase_risk_scores
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can track device fingerprints" ON public.device_fingerprints
FOR ALL USING (true);

CREATE POLICY "Admins can manage signing keys" ON public.qr_signing_keys
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_fraud_alerts_entity ON public.fraud_alerts(entity_type, entity_id);
CREATE INDEX idx_fraud_alerts_status ON public.fraud_alerts(status, created_at);
CREATE INDEX idx_ticket_validations_ticket ON public.ticket_validations(ticket_id, created_at);
CREATE INDEX idx_ticket_validations_device ON public.ticket_validations(device_fingerprint);
CREATE INDEX idx_risk_scores_order ON public.purchase_risk_scores(order_id);
CREATE INDEX idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);

-- Triggers for automatic fraud detection
CREATE OR REPLACE FUNCTION public.check_duplicate_scan()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for duplicate scans within 5 minutes
  IF EXISTS (
    SELECT 1 FROM public.ticket_validations 
    WHERE ticket_id = NEW.ticket_id 
    AND validation_result = 'valid'
    AND created_at > now() - INTERVAL '5 minutes'
  ) THEN
    -- Create fraud alert
    INSERT INTO public.fraud_alerts (
      alert_type, entity_type, entity_id, severity_level, details
    ) VALUES (
      'duplicate_scan', 'ticket', NEW.ticket_id, 'high',
      jsonb_build_object(
        'previous_scan_time', (
          SELECT created_at FROM public.ticket_validations 
          WHERE ticket_id = NEW.ticket_id AND validation_result = 'valid'
          ORDER BY created_at DESC LIMIT 1
        ),
        'device_fingerprint', NEW.device_fingerprint,
        'ip_address', NEW.ip_address
      )
    );
    
    -- Mark as duplicate
    NEW.validation_result = 'duplicate';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_duplicate_scan
  BEFORE INSERT ON public.ticket_validations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_duplicate_scan();

-- Function to calculate purchase risk score
CREATE OR REPLACE FUNCTION public.calculate_risk_score(order_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  risk_score INTEGER := 0;
  order_record RECORD;
  device_record RECORD;
  recent_orders INTEGER;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = order_uuid;
  
  -- Check purchase velocity (multiple orders in short time)
  SELECT COUNT(*) INTO recent_orders 
  FROM public.orders 
  WHERE customer_email = order_record.customer_email 
  AND created_at > now() - INTERVAL '1 hour';
  
  IF recent_orders > 3 THEN
    risk_score := risk_score + 30;
  ELSIF recent_orders > 1 THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- Check if large quantity order
  IF order_record.total_amount > 1000 THEN
    risk_score := risk_score + 15;
  END IF;
  
  -- Check for suspicious patterns
  IF order_record.customer_first_name = order_record.customer_last_name THEN
    risk_score := risk_score + 5;
  END IF;
  
  RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;