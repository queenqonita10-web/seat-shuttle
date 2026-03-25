
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_route_id_fkey') THEN
    ALTER TABLE public.trips ADD CONSTRAINT trips_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_driver_id_fkey') THEN
    ALTER TABLE public.trips ADD CONSTRAINT trips_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_vehicle_id_fkey') THEN
    ALTER TABLE public.trips ADD CONSTRAINT trips_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_vehicle_type_id_fkey') THEN
    ALTER TABLE public.trips ADD CONSTRAINT trips_vehicle_type_id_fkey FOREIGN KEY (vehicle_type_id) REFERENCES public.vehicle_types(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_trip_id_fkey') THEN
    ALTER TABLE public.bookings ADD CONSTRAINT bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_booking_id_fkey') THEN
    ALTER TABLE public.tickets ADD CONSTRAINT tickets_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_trip_id_fkey') THEN
    ALTER TABLE public.tickets ADD CONSTRAINT tickets_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_route_id_fkey') THEN
    ALTER TABLE public.tickets ADD CONSTRAINT tickets_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seats_trip_id_fkey') THEN
    ALTER TABLE public.seats ADD CONSTRAINT seats_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pickup_points_route_id_fkey') THEN
    ALTER TABLE public.pickup_points ADD CONSTRAINT pickup_points_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_locations_driver_id_fkey') THEN
    ALTER TABLE public.driver_locations ADD CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_transactions_booking_id_fkey') THEN
    ALTER TABLE public.payment_transactions ADD CONSTRAINT payment_transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_vehicle_type_id_fkey') THEN
    ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_vehicle_type_id_fkey FOREIGN KEY (vehicle_type_id) REFERENCES public.vehicle_types(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_assigned_route_id_fkey') THEN
    ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_assigned_route_id_fkey FOREIGN KEY (assigned_route_id) REFERENCES public.routes(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_layout_template_id_fkey') THEN
    ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_layout_template_id_fkey FOREIGN KEY (layout_template_id) REFERENCES public.seat_layout_templates(id);
  END IF;
END $$;
