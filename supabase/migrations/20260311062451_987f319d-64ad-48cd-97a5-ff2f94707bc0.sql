
-- Quote requests table for safari custom quotes
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  guests_count integer NOT NULL DEFAULT 2,
  preferred_dates text,
  destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_days integer,
  estimated_price numeric,
  special_requests text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a quote (even unauthenticated)
CREATE POLICY "Anyone can submit quote requests"
  ON public.quote_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- Admin/staff can view all quotes
CREATE POLICY "Admin and staff can manage quotes"
  ON public.quote_requests FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Users can view their own quotes
CREATE POLICY "Users can view own quotes"
  ON public.quote_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
