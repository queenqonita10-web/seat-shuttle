-- =============================================
-- PYU-GO Phase 1: Complete Production Schema
-- Database Schema + Auth + RLS Policies
-- =============================================

-- ========== 1. ENUMS & TYPES ==========

CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'passenger');

CREATE TYPE public.trip_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TYPE public.booking_status AS ENUM ('pending', 'picked_up', 'no_show', 'cancelled');

CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled', 'expired');

CREATE TYPE public.vehicle_status AS ENUM ('active', 'maintenance', 'inactive');

CREATE TYPE public.driver_status AS ENUM ('online', 'offline', 'on_trip');

CREATE TYPE public.seat_status AS ENUM ('available', 'booked', 'reserved');

CREATE TYPE public.ticket_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TYPE public.tracking_status AS ENUM ('scheduled', 'driver_assigned', 'en_route', 'arrived_at_pickup', 'picked_up', 'arrived_at_destination');

-- ========== 2. UTILITY FUNCTIONS ==========

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========== 3. CORE TABLES ==========

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  address TEXT DEFAULT '',
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_trips INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 4. ROUTES & LOCATIONS ==========

-- Routes
CREATE TABLE public.routes (
  id TEXT PRIMARY KEY,
  route_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance NUMERIC NOT NULL DEFAULT 0,
  estimated_time TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active routes" ON public.routes FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Admins can manage routes" ON public.routes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pickup points
CREATE TABLE public.pickup_points (
  id TEXT NOT NULL,
  route_id TEXT NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  time_offset INTEGER NOT NULL DEFAULT 0,
  fare NUMERIC NOT NULL DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  PRIMARY KEY (id, route_id)
);

ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pickup points" ON public.pickup_points FOR SELECT USING (true);
CREATE POLICY "Admins can manage pickup points" ON public.pickup_points FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========== 5. VEHICLES ==========

-- Vehicle types
CREATE TABLE public.vehicle_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read vehicle types" ON public.vehicle_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle types" ON public.vehicle_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seat layout templates
CREATE TABLE public.seat_layout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rows INTEGER NOT NULL,
  cols INTEGER NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seat_layout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read seat layouts" ON public.seat_layout_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage seat layouts" ON public.seat_layout_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles
CREATE TABLE public.vehicles (
  id TEXT PRIMARY KEY,
  vehicle_type_id TEXT NOT NULL REFERENCES public.vehicle_types(id),
  layout_template_id TEXT REFERENCES public.seat_layout_templates(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '',
  license_plate TEXT NOT NULL UNIQUE,
  status vehicle_status NOT NULL DEFAULT 'active',
  assigned_route_id TEXT REFERENCES public.routes(id),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active vehicles" ON public.vehicles FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Admins can manage vehicles" ON public.vehicles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 6. DRIVERS ==========

CREATE TABLE public.drivers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  status driver_status NOT NULL DEFAULT 'offline',
  avatar_url TEXT DEFAULT '',
  license_number TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can update own record" ON public.drivers FOR UPDATE USING (user_id = auth.uid());

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 7. TRIPS & SEATS ==========

-- Trips
CREATE TABLE public.trips (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES public.routes(id),
  departure_time TEXT NOT NULL,
  vehicle_type_id TEXT NOT NULL REFERENCES public.vehicle_types(id),
  vehicle_id TEXT REFERENCES public.vehicles(id),
  driver_id TEXT REFERENCES public.drivers(id),
  status trip_status NOT NULL DEFAULT 'pending',
  departure_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_arrival_time TEXT,
  actual_departure_time TIMESTAMPTZ,
  actual_arrival_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Admins can manage trips" ON public.trips FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can update own trips" ON public.trips FOR UPDATE USING (driver_id IS NOT NULL AND public.has_role(auth.uid(), 'driver'));

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_trips_route_id ON public.trips(route_id);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_departure_date ON public.trips(departure_date);

-- Seats
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  row_num INTEGER NOT NULL,
  col_num INTEGER NOT NULL,
  status seat_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, seat_number)
);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Admins can manage seats" ON public.seats FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 8. BOOKINGS & PAYMENTS ==========

-- Bookings
CREATE TABLE public.bookings (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id),
  user_id UUID REFERENCES auth.users(id),
  seat_number TEXT NOT NULL,
  pickup_point_id TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'pending',
  payment_status public.payment_status_enum NOT NULL DEFAULT 'pending',
  status booking_status NOT NULL DEFAULT 'pending',
  fare NUMERIC NOT NULL DEFAULT 0,
  booking_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can view trip bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
);

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_trip_id ON public.bookings(trip_id);

-- Payment transactions
CREATE TABLE public.payment_transactions (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  midtrans_transaction_id TEXT UNIQUE,
  midtrans_order_id TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status public.payment_status_enum NOT NULL DEFAULT 'pending',
  transaction_time TIMESTAMPTZ,
  transaction_status TEXT,
  fraud_status TEXT,
  payment_type TEXT,
  snap_token TEXT,
  snap_redirect_url TEXT,
  metadata JSONB DEFAULT '{}',
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can create payment transactions" ON public.payment_transactions 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));
CREATE POLICY "Admins can manage all transactions" ON public.payment_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(midtrans_order_id);

-- ========== 9. TICKETS ==========

CREATE TABLE public.tickets (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES public.trips(id),
  route_id TEXT NOT NULL REFERENCES public.routes(id),
  seat_number TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT NOT NULL,
  pickup_point_id TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'active',
  tracking_status tracking_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all tickets" ON public.tickets FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can view trip tickets" ON public.tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
);

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_tickets_booking_id ON public.tickets(booking_id);
CREATE INDEX idx_tickets_trip_id ON public.tickets(trip_id);

-- ========== 10. REAL-TIME TRACKING ==========

CREATE TABLE public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  trip_id TEXT REFERENCES public.trips(id),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed NUMERIC,
  heading NUMERIC,
  accuracy NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own locations" ON public.driver_locations FOR INSERT WITH CHECK (
  driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
CREATE POLICY "Passengers can view active locations" ON public.driver_locations FOR SELECT USING (true);
CREATE POLICY "Admins can view all locations" ON public.driver_locations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX idx_driver_locations_timestamp ON public.driver_locations(timestamp DESC);

-- ========== 11. AUDIT LOGS ==========

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ========== 12. AUTH TRIGGERS ==========

-- Create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== 13. GRANTS ==========

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
