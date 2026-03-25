import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Driver {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  status: "online" | "offline" | "on_trip";
  avatar_url: string | null;
  license_number: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active drivers
 */
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Fetch drivers by status
 */
export function useDriversByStatus(status: "online" | "offline" | "on_trip") {
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
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for status)
  });
}

/**
 * Get driver details with verification status
 */
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

/**
 * Fetch verified drivers only
 */
export function useVerifiedDrivers() {
  return useQuery<Driver[], Error>({
    queryKey: ["drivers-verified"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .not("verified_at", "is", null)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Subscribe to driver status updates (real-time)
 */
export function useDriverStatusSubscription(driverId: string) {
  return useQuery<Driver | null, Error>({
    queryKey: ["driver-status", driverId],
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
    staleTime: 0,
    refetchInterval: 2000, // Poll every 2 seconds for real-time status
  });
}
