import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PickupPoint {
  id: string;
  route_id: string;
  label: string;
  description: string | null;
  sort_order: number;
  time_offset: number;
  fare: number;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Fetch pickup points for a specific route
 * Returns sorted by order
 */
export function usePickupPoints(routeId: string) {
  return useQuery<PickupPoint[], Error>({
    queryKey: ["pickup-points", routeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pickup_points")
        .select("*")
        .eq("route_id", routeId)
        .order("sort_order");

      if (error) {
        console.error("Error fetching pickup points:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!routeId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Get single pickup point details
 */
export function usePickupPointDetail(pickupPointId: string, routeId: string) {
  return useQuery<PickupPoint | null, Error>({
    queryKey: ["pickup-point", pickupPointId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pickup_points")
        .select("*")
        .eq("id", pickupPointId)
        .eq("route_id", routeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!pickupPointId && !!routeId,
    staleTime: 15 * 60 * 1000,
  });
}
