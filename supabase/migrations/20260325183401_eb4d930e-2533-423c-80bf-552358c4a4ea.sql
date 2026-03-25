
-- =============================================
-- PYU-GO Production Schema — Fase 1
-- =============================================

-- 1. Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'driver');

-- 2. Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. User roles table (MUST be before has_role function)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. has_role function (SECURITY DEFINER)
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

-- 5. RLS for user_roles (after has_role exists)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Profiles table
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

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Routes table
CREATE TABLE public.routes (
  id TEXT PRIMARY KEY,
  route_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance NUMERIC NOT NULL DEFAULT 0,
  estimated_time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active routes" ON public.routes FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Admins can manage routes" ON public.routes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Pickup points table
CREATE TABLE public.pickup_points (
  id TEXT NOT NULL,
  route_id TEXT NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  time_offset INTEGER NOT NULL DEFAULT 0,
  fare NUMERIC NOT NULL DEFAULT 0,
  PRIMARY KEY (id, route_id)
);

ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read pickup points" ON public.pickup_points FOR SELECT USING (true);
CREATE POLICY "Admins can manage pickup points" ON public.pickup_points FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 10. Vehicle types table
CREATE TABLE public.vehicle_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read vehicle types" ON public.vehicle_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle types" ON public.vehicle_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 11. Seat layout templates
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

-- 12. Vehicles table
CREATE TABLE public.vehicles (
  id TEXT PRIMARY KEY,
  vehicle_type_id TEXT NOT NULL REFERENCES public.vehicle_types(id),
  layout_template_id TEXT REFERENCES public.seat_layout_templates(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '',
  license_plate TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  assigned_route_id TEXT REFERENCES public.routes(id),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active vehicles" ON public.vehicles FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Admins can manage vehicles" ON public.vehicles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Drivers table
CREATE TABLE public.drivers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'on_trip')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can update own record" ON public.drivers FOR UPDATE USING (user_id = auth.uid());
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Trips table
CREATE TABLE public.trips (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES public.routes(id),
  departure_time TEXT NOT NULL,
  vehicle_type_id TEXT NOT NULL REFERENCES public.vehicle_types(id),
  vehicle_id TEXT REFERENCES public.vehicles(id),
  driver_id TEXT REFERENCES public.drivers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'completed', 'cancelled', 'pending')),
  departure_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Admins can manage trips" ON public.trips FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Seats table
CREATE TABLE public.seats (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  row_num INTEGER NOT NULL,
  col_num INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'locked')),
  UNIQUE (trip_id, seat_number)
);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Admins can manage seats" ON public.seats FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can update seat status" ON public.seats FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 16. Bookings table
CREATE TABLE public.bookings (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES public.trips(id),
  user_id UUID REFERENCES auth.users(id),
  seat_number TEXT NOT NULL,
  pickup_point_id TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'no_show', 'cancelled')),
  fare NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can view trip bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'driver'));
CREATE POLICY "Drivers can update booking status" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'driver'));
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Tickets table
CREATE TABLE public.tickets (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES public.trips(id),
  route_id TEXT NOT NULL REFERENCES public.routes(id),
  seat_number TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT NOT NULL,
  pickup_point_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  tracking_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (tracking_status IN ('scheduled', 'driver_assigned', 'en_route', 'arrived_at_pickup', 'picked_up', 'arrived_at_destination')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all tickets" ON public.tickets FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can view trip tickets" ON public.tickets FOR SELECT USING (public.has_role(auth.uid(), 'driver'));
CREATE POLICY "Drivers can update ticket status" ON public.tickets FOR UPDATE USING (public.has_role(auth.uid(), 'driver'));
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 18. Driver locations (realtime)
CREATE TABLE public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL UNIQUE REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION DEFAULT 0,
  speed DOUBLE PRECISION DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read driver locations" ON public.driver_locations FOR SELECT USING (true);
CREATE POLICY "Drivers can upsert own location" ON public.driver_locations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND d.user_id = auth.uid())
);
CREATE POLICY "Drivers can update own location" ON public.driver_locations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND d.user_id = auth.uid())
);

-- 19. Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  module TEXT NOT NULL CHECK (module IN ('ROUTE', 'VEHICLE', 'TRIP', 'BOOKING', 'DRIVER', 'TICKET')),
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can create audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 20. Enable realtime for driver_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- 21. Indexes
CREATE INDEX idx_pickup_points_route ON public.pickup_points(route_id);
CREATE INDEX idx_trips_route ON public.trips(route_id);
CREATE INDEX idx_trips_driver ON public.trips(driver_id);
CREATE INDEX idx_seats_trip ON public.seats(trip_id);
CREATE INDEX idx_bookings_trip ON public.bookings(trip_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_tickets_booking ON public.tickets(booking_id);
CREATE INDEX idx_tickets_trip ON public.tickets(trip_id);
CREATE INDEX idx_driver_locations_driver ON public.driver_locations(driver_id);
CREATE INDEX idx_audit_logs_module ON public.audit_logs(module);
