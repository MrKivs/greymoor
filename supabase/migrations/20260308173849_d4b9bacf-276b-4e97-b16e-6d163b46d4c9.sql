
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'guest');
CREATE TYPE public.room_type AS ENUM ('standard', 'deluxe', 'suite', 'villa');
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'mpesa', 'card', 'bank_transfer');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'refunded');
CREATE TYPE public.safari_status AS ENUM ('active', 'inactive');
CREATE TYPE public.safari_difficulty AS ENUM ('easy', 'moderate', 'challenging', 'extreme');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'guest',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'staff' THEN 2 WHEN 'guest' THEN 3 END LIMIT 1 $$;

-- Rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  room_type room_type NOT NULL DEFAULT 'standard',
  floor INT NOT NULL DEFAULT 1,
  capacity INT NOT NULL DEFAULT 2,
  price_per_night NUMERIC(10,2) NOT NULL,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  status room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Safari packages
CREATE TABLE public.safari_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  destinations JSONB DEFAULT '[]'::jsonb,
  highlights TEXT[] DEFAULT '{}',
  max_group_size INT NOT NULL DEFAULT 10,
  price_per_person NUMERIC(10,2) NOT NULL,
  difficulty_level safari_difficulty NOT NULL DEFAULT 'moderate',
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  itinerary JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  status safari_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safari_packages ENABLE ROW LEVEL SECURITY;

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  passport_number TEXT,
  nationality TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  loyalty_points INT NOT NULL DEFAULT 0,
  total_stays INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Booking ref sequence
CREATE SEQUENCE public.booking_ref_seq START WITH 1;
CREATE OR REPLACE FUNCTION public.generate_booking_ref()
RETURNS TEXT LANGUAGE sql
AS $$ SELECT 'GS-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('public.booking_ref_seq')::TEXT, 5, '0') $$;

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT NOT NULL UNIQUE DEFAULT public.generate_booking_ref(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  safari_package_id UUID REFERENCES public.safari_packages(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT NOT NULL DEFAULT 1,
  total_nights INT NOT NULL,
  room_subtotal NUMERIC(10,2) NOT NULL,
  safari_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  taxes NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Receipt sequence
CREATE SEQUENCE public.receipt_ref_seq START WITH 1;
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT LANGUAGE sql
AS $$ SELECT 'RCP-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('public.receipt_ref_seq')::TEXT, 5, '0') $$;

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_ref TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  receipt_number TEXT NOT NULL UNIQUE DEFAULT public.generate_receipt_number(),
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_safari_packages_updated_at BEFORE UPDATE ON public.safari_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'guest');
  INSERT INTO public.customers (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES

-- Profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Rooms (public read)
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admin can manage rooms" ON public.rooms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can update rooms" ON public.rooms FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'staff'));

-- Safari packages (public read)
CREATE POLICY "Anyone can view safaris" ON public.safari_packages FOR SELECT USING (true);
CREATE POLICY "Admin can manage safaris" ON public.safari_packages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Customers
CREATE POLICY "Customers can view own data" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Customers can update own data" ON public.customers FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Staff can view all customers" ON public.customers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin can manage customers" ON public.customers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bookings
CREATE POLICY "Guests can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Guests can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Staff can view all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin can manage bookings" ON public.bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "Guests can view own payments" ON public.payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.customer_id = auth.uid()));
CREATE POLICY "Staff can view all payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff can create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin can manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
