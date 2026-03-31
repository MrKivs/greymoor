
-- Housekeeping task statuses
CREATE TYPE public.housekeeping_status AS ENUM ('pending', 'in_progress', 'done', 'inspected');

-- Housekeeping task types
CREATE TYPE public.housekeeping_task_type AS ENUM ('checkout_clean', 'stayover_clean', 'turndown', 'guest_request', 'deep_clean');

-- Maintenance priority
CREATE TYPE public.maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Maintenance status
CREATE TYPE public.maintenance_status AS ENUM ('reported', 'assigned', 'in_progress', 'completed');

-- Housekeeping tasks table
CREATE TABLE public.housekeeping_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  task_type housekeeping_task_type NOT NULL DEFAULT 'stayover_clean',
  status housekeeping_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority maintenance_priority NOT NULL DEFAULT 'medium',
  status maintenance_status NOT NULL DEFAULT 'reported',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guest housekeeping requests table
CREATE TABLE public.guest_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_requests ENABLE ROW LEVEL SECURITY;

-- Housekeeping tasks policies
CREATE POLICY "Staff can manage housekeeping" ON public.housekeeping_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can manage housekeeping" ON public.housekeeping_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Maintenance request policies
CREATE POLICY "Staff can manage maintenance" ON public.maintenance_requests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Guests can create maintenance" ON public.maintenance_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Guests can view own maintenance" ON public.maintenance_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = reported_by);

-- Guest requests policies
CREATE POLICY "Guests can create requests" ON public.guest_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Guests can view own requests" ON public.guest_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = guest_id);

CREATE POLICY "Staff can manage guest requests" ON public.guest_requests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for guest requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.housekeeping_tasks;

-- Updated at triggers
CREATE TRIGGER update_housekeeping_tasks_updated_at BEFORE UPDATE ON public.housekeeping_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_requests_updated_at BEFORE UPDATE ON public.guest_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
