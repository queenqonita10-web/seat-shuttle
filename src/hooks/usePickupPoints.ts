import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PickupPoint = Tables<"pickup_points">;

export function usePickupPoints(routeId: string) {
  return useQuery<PickupPoint[], Error>({
    queryKey: ["pickup-points", routeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pickup_points")
        .select("*")
        .eq("route_id", routeId)
        .order("sort_order");

      if (error) throw error;
      return data || [];
    },
    enabled: !!routeId,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

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
