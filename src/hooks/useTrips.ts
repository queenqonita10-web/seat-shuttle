import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TripWithSeats {
  id: string;
  route_id: string;
  departure_time: string;
  vehicle_type_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  status: string;
  departure_date: string;
  seats: {
    id: string;
    seat_number: string;
    row_num: number;
    col_num: number;
    status: string;
  }[];
}

export function useTripsByRoute(routeId: string | undefined) {
  return useQuery({
    queryKey: ["trips", "route", routeId],
    queryFn: async (): Promise<TripWithSeats[]> => {
      if (!routeId) return [];

      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("route_id", routeId)
        .in("status", ["active", "pending"]);

      if (error) throw error;

      const tripIds = (trips ?? []).map((t) => t.id);

      const { data: seats, error: seatError } = await supabase
        .from("seats")
        .select("*")
        .in("trip_id", tripIds);

      if (seatError) throw seatError;

      return (trips ?? []).map((t) => ({
        ...t,
        seats: (seats ?? []).filter((s) => s.trip_id === t.id),
      }));
    },
    enabled: !!routeId,
  });
}

export function useTripsByRoutes(routeIds: string[]) {
  return useQuery({
    queryKey: ["trips", "routes", routeIds],
    queryFn: async (): Promise<TripWithSeats[]> => {
      if (routeIds.length === 0) return [];

      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .in("route_id", routeIds)
        .in("status", ["active", "pending"]);

      if (error) throw error;

      const tripIds = (trips ?? []).map((t) => t.id);
      if (tripIds.length === 0) return [];

      const { data: seats, error: seatError } = await supabase
        .from("seats")
        .select("*")
        .in("trip_id", tripIds);

      if (seatError) throw seatError;

      return (trips ?? []).map((t) => ({
        ...t,
        seats: (seats ?? []).filter((s) => s.trip_id === t.id),
      }));
    },
    enabled: routeIds.length > 0,
  });
}

export function useAllTrips() {
  return useQuery({
    queryKey: ["trips", "all"],
    queryFn: async (): Promise<TripWithSeats[]> => {
      const { data: trips, error } = await supabase
        .from("trips")
        .select("*");

      if (error) throw error;

      const tripIds = (trips ?? []).map((t) => t.id);

      const { data: seats, error: seatError } = await supabase
        .from("seats")
        .select("*")
        .in("trip_id", tripIds);

      if (seatError) throw seatError;

      return (trips ?? []).map((t) => ({
        ...t,
        seats: (seats ?? []).filter((s) => s.trip_id === t.id),
      }));
    },
  });
}
