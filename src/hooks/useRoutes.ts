import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RouteWithPickups {
  id: string;
  route_code: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimated_time: string;
  status: string;
  is_deleted: boolean;
  pickup_points: {
    id: string;
    label: string;
    sort_order: number;
    time_offset: number;
    fare: number;
  }[];
}

export function useRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: async (): Promise<RouteWithPickups[]> => {
      const { data: routes, error } = await supabase
        .from("routes")
        .select("*")
        .eq("is_deleted", false)
        .eq("status", "active");

      if (error) throw error;

      const { data: pickups, error: pickupError } = await supabase
        .from("pickup_points")
        .select("*")
        .order("sort_order");

      if (pickupError) throw pickupError;

      return (routes ?? []).map((r) => ({
        ...r,
        pickup_points: (pickups ?? [])
          .filter((p) => p.route_id === r.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
  });
}

export function useRoutesByDestination(destination: string | undefined) {
  return useQuery({
    queryKey: ["routes", "destination", destination],
    queryFn: async (): Promise<RouteWithPickups[]> => {
      if (!destination) return [];
      
      const { data: routes, error } = await supabase
        .from("routes")
        .select("*")
        .eq("destination", destination)
        .eq("is_deleted", false)
        .eq("status", "active");

      if (error) throw error;

      const routeIds = (routes ?? []).map((r) => r.id);
      
      const { data: pickups, error: pickupError } = await supabase
        .from("pickup_points")
        .select("*")
        .in("route_id", routeIds)
        .order("sort_order");

      if (pickupError) throw pickupError;

      return (routes ?? []).map((r) => ({
        ...r,
        pickup_points: (pickups ?? [])
          .filter((p) => p.route_id === r.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
    enabled: !!destination,
  });
}

export function usePickupPoints() {
  return useQuery({
    queryKey: ["pickup_points", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pickup_points")
        .select("id, label, sort_order, time_offset, fare")
        .order("sort_order");

      if (error) throw error;

      // Deduplicate by id (same pickup can exist on multiple routes)
      const unique = new Map<string, typeof data[0]>();
      for (const p of data ?? []) {
        if (!unique.has(p.id)) unique.set(p.id, { ...p, fare: 0 });
      }
      return Array.from(unique.values());
    },
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("destination")
        .eq("is_deleted", false)
        .eq("status", "active");

      if (error) throw error;
      const unique = [...new Set((data ?? []).map((r) => r.destination))];
      return unique;
    },
  });
}
