
-- Safari Guides
CREATE TABLE IF NOT EXISTS public.safari_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  specialties TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.safari_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view guides" ON public.safari_guides FOR SELECT USING (true);
CREATE POLICY "Admin can manage guides" ON public.safari_guides FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Safari Vehicles
CREATE TABLE IF NOT EXISTS public.safari_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'Land Cruiser',
  registration_number TEXT UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 6,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','on-tour','maintenance')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.safari_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view vehicles" ON public.safari_vehicles FOR SELECT USING (true);
CREATE POLICY "Admin can manage vehicles" ON public.safari_vehicles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  room_rating INTEGER CHECK (room_rating BETWEEN 1 AND 5),
  safari_rating INTEGER CHECK (safari_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  comment TEXT,
  reviewer_name TEXT,
  reviewer_nationality TEXT,
  stay_type TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published reviews visible to all" ON public.reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Guests can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Guests can view own reviews" ON public.reviews FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admin can manage reviews" ON public.reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('booking','payment','system','reminder','alert')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all notifications" ON public.notifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_safari_guides_updated_at BEFORE UPDATE ON public.safari_guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_safari_vehicles_updated_at BEFORE UPDATE ON public.safari_vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
