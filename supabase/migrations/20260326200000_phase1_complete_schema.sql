-- Fase 1: Database Schema Migration

-- 1. Custom Types
CREATE TYPE app_role AS ENUM ('admin', 'driver');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE ticket_status AS ENUM ('valid', 'used', 'expired');
CREATE TYPE vehicle_status AS ENUM ('available', 'in_trip', 'maintenance');
CREATE TYPE driver_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE seat_status AS ENUM ('available', 'booked', 'locked');

-- 2. Tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  loyalty_points INT DEFAULT 0
);

CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE seat_layout_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rows INT NOT NULL,
  cols INT NOT NULL,
  layout JSONB NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  layout_id BIGINT REFERENCES seat_layout_templates(id),
  capacity INT NOT NULL
);

CREATE TABLE vehicles (
  id BIGSERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  type_id BIGINT REFERENCES vehicle_types(id),
  status vehicle_status DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drivers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  status driver_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE routes (
  id VARCHAR(20) PRIMARY KEY,
  route_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance NUMERIC(10, 2) NOT NULL,
  estimated_time VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pickup_points (
  id BIGSERIAL PRIMARY KEY,
  route_id VARCHAR(20) REFERENCES routes(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  "order" INT NOT NULL,
  time_offset INTERVAL NOT NULL,
  fare_adjustment NUMERIC(10, 2) DEFAULT 0,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6)
);

CREATE TABLE trips (
  id BIGSERIAL PRIMARY KEY,
  route_id VARCHAR(20) REFERENCES routes(id),
  vehicle_id BIGINT REFERENCES vehicles(id),
  driver_id BIGINT REFERENCES drivers(id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'scheduled',
  base_fare NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seats (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT REFERENCES trips(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  status seat_status DEFAULT 'available',
  UNIQUE(trip_id, seat_number)
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT REFERENCES trips(id),
  passenger_id UUID REFERENCES auth.users(id),
  pickup_point_id BIGINT REFERENCES pickup_points(id),
  num_passengers INT NOT NULL,
  total_fare NUMERIC(10, 2) NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  passenger_name VARCHAR(255),
  qr_code TEXT,
  status ticket_status DEFAULT 'valid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE driver_locations (
  id BIGSERIAL PRIMARY KEY,
  driver_id BIGINT REFERENCES drivers(id) ON DELETE CASCADE,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  modified_table VARCHAR(100),
  record_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Functions & Triggers

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = has_role.user_id AND user_roles.role = has_role.role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view and update their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read routes" ON routes
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage routes" ON routes
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read pickup points" ON pickup_points
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage pickup points" ON pickup_points
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read vehicle types" ON vehicle_types
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle types" ON vehicle_types
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read trips" ON trips
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage trips" ON trips
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read seat status" ON seats
  FOR SELECT USING (true);
CREATE POLICY "Admins and drivers can manage seats" ON seats
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'driver'));

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can create and view their own bookings" ON bookings
  FOR ALL USING (auth.uid() = passenger_id);
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view their own tickets" ON tickets
  FOR SELECT USING (booking_id IN (SELECT id FROM bookings WHERE passenger_id = auth.uid()));
CREATE POLICY "Admins and drivers can view all tickets" ON tickets
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'driver'));

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin-only access for vehicles" ON vehicles
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin-only access for drivers" ON drivers
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Driver can update their own location" ON driver_locations
  FOR ALL USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can view driver locations" ON driver_locations
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin-only access for audit logs" ON audit_logs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

ALTER TABLE seat_layout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin-only access for seat layout templates" ON seat_layout_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Function to get daily booking trends for the last 7 days
CREATE OR REPLACE FUNCTION get_daily_booking_trends()
RETURNS TABLE(day TEXT, bookings BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(d.day, 'Dy') AS day,
    COALESCE(b.bookings, 0) AS bookings
  FROM 
    generate_series(
      (NOW() - interval '6 days')::date,
      NOW()::date,
      '1 day'::interval
    ) d(day)
  LEFT JOIN (
    SELECT 
      date_trunc('day', created_at)::date AS booking_day,
      COUNT(*) as bookings
    FROM bookings
    WHERE created_at >= NOW() - interval '7 days'
    GROUP BY 1
  ) b ON d.day = b.booking_day
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql;

-- Driver Operations Functions

CREATE OR REPLACE FUNCTION start_trip(trip_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE trips SET status = 'active', departure_time = NOW() WHERE id = trip_id_param;
  UPDATE vehicles SET status = 'in_trip' WHERE id = (SELECT vehicle_id FROM trips WHERE id = trip_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_in_passenger(ticket_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE tickets SET status = 'used' WHERE id = ticket_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_no_show(booking_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE bookings SET status = 'cancelled' WHERE id = booking_id_param;
  -- Potentially add logic to handle seat availability
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION end_trip(trip_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE trips SET status = 'completed', arrival_time = NOW() WHERE id = trip_id_param;
  UPDATE vehicles SET status = 'available' WHERE id = (SELECT vehicle_id FROM trips WHERE id = trip_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
