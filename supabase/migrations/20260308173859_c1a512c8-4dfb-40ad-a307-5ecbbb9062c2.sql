
CREATE OR REPLACE FUNCTION public.generate_booking_ref()
RETURNS TEXT LANGUAGE sql SET search_path = public
AS $$ SELECT 'GS-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('public.booking_ref_seq')::TEXT, 5, '0') $$;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT LANGUAGE sql SET search_path = public
AS $$ SELECT 'RCP-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('public.receipt_ref_seq')::TEXT, 5, '0') $$;
