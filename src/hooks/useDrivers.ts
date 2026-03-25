import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Driver = Tables<"drivers">;

export function useDrivers() {
  return useQuery<Driver[], Error>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching drivers:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useDriversByStatus(status: string) {
  return useQuery<Driver[], Error>({
    queryKey: ["drivers-by-status", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("status", status)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDriverDetail(driverId: string) {
  return useQuery<Driver | null, Error>({
    queryKey: ["driver", driverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", driverId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!driverId,
    staleTime: 5 * 60 * 1000,
  });
}
