
-- Seasonal Pricing Rules table
CREATE TABLE public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('peak_season', 'low_season', 'weekend_surcharge', 'last_minute', 'long_stay')),
  room_type public.room_type NULL, -- NULL means applies to all room types
  multiplier numeric NOT NULL DEFAULT 1.0, -- e.g. 1.2 for 20% increase, 0.8 for 20% discount
  start_date date NULL,
  end_date date NULL,
  min_nights integer NULL, -- for long_stay rules
  max_hours_before integer NULL, -- for last_minute rules (hours before check-in)
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0, -- higher priority rules applied first
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage pricing rules" ON public.pricing_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active pricing rules" ON public.pricing_rules FOR SELECT TO authenticated
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notification preferences table for email/SMS
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  event_type text NOT NULL CHECK (event_type IN ('booking_confirmation', 'checkin_reminder', 'checkout_reminder', 'payment_receipt', 'safari_reminder', 'cancellation', 'welcome_back')),
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel, event_type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification prefs" ON public.notification_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all notification prefs" ON public.notification_preferences FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Notification log table
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  channel text NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  message_preview text,
  external_id text, -- third-party message ID
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can view notification log" ON public.notification_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Users can view own notifications" ON public.notification_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
