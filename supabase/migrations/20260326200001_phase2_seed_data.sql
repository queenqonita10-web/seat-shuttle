-- Fase 2: Seed Data

-- 1. Seat Layout Templates
INSERT INTO public.seat_layout_templates (name, rows, cols, layout, capacity)
VALUES
  ('Standard 12-Seater', 4, 4, '{"layout":["driver",null,"aisle","exit","seat","seat","aisle","seat","seat","seat","aisle","seat","seat","seat","aisle","seat"]}', 12),
  ('Luxury 8-Seater', 3, 4, '{"layout":["driver",null,"aisle","exit","seat","seat","aisle","seat",null,null,"aisle","seat"]}', 8);

-- 2. Vehicle Types
INSERT INTO public.vehicle_types (name, layout_id, capacity)
VALUES
  ('Toyota HiAce Commuter', 1, 12),
  ('Mercedes-Benz Sprinter', 2, 8);

-- 3. Vehicles
INSERT INTO public.vehicles (brand, model, plate_number, type_id, status)
VALUES
  ('Toyota', 'HiAce Commuter', 'B 1234 ABC', 1, 'available'),
  ('Mercedes-Benz', 'Sprinter', 'D 5678 XYZ', 2, 'available');

-- 4. Routes & Pickup Points
INSERT INTO public.routes (id, route_code, name, origin, destination, distance, estimated_time)
VALUES
  ('RTE-JOG-SMG-01', 'JOG-SMG', 'Jogja - Semarang Express', 'Yogyakarta', 'Semarang', 130, '3 hours');

INSERT INTO public.pickup_points (route_id, label, "order", time_offset, fare_adjustment)
VALUES
  ('RTE-JOG-SMG-01', 'Terminal Jombor', 1, '00:00:00', 0),
  ('RTE-JOG-SMG-01', 'Monumen Jogja Kembali', 2, '00:15:00', 5000),
  ('RTE-JOG-SMG-01', 'Hartono Mall', 3, '00:30:00', 7000);

-- Note: Users/Drivers need to be created via Auth UI for real testing
-- This is just placeholder data. Replace UUIDs with actual user UUIDs from your auth.users table.

-- 5. Drivers (requires existing users in auth.users)
-- INSERT INTO public.drivers (user_id, name, phone, license_number, status)
-- VALUES
--   ('uuid-of-driver-user-1', 'Budi Santoso', '081234567890', 'SIM-12345', 'active');

-- 6. Trips (requires existing routes, vehicles, drivers)
-- INSERT INTO public.trips (route_id, vehicle_id, driver_id, departure_time, base_fare)
-- VALUES
--   ('RTE-JOG-SMG-01', 1, 1, NOW() + interval '2 hour', 75000);
