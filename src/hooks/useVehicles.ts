import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVehicleTypes() {
  return useQuery({
    queryKey: ["vehicle_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_deleted", false);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSeatLayoutTemplates() {
  return useQuery({
    queryKey: ["seat_layout_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seat_layout_templates")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}
