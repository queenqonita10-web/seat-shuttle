import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Driver = Tables<"drivers">;

interface DriverFilters {
  status?: string;
}

/**
 * Fetch all admin drivers with optional filters
 */
export function useAdminDrivers(filters?: DriverFilters) {
  return useQuery<Driver[]>({
    queryKey: ["admin-drivers", filters],
    queryFn: async () => {
      let query = supabase.from("drivers").select("*");

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Fetch single driver details
 */
export function useAdminDriverDetail(driverId: string) {
  return useQuery<Driver>({
    queryKey: ["admin-driver", driverId],
    enabled: !!driverId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", driverId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

/**
 * Create new driver
 */
export function useAdminDriverCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverData: Omit<Driver, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("drivers")
        .insert([driverData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toast.success("Driver created successfully");
    },
    onError: (error: Error) => {
      toast.error(\Failed to create driver: \\);
    },
  });
}

/**
 * Update driver
 */
export function useAdminDriverUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Driver>;
    }) => {
      const { data, error } = await supabase
        .from("drivers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toast.success("Driver updated successfully");
    },
    onError: (error: Error) => {
      toast.error(\Failed to update driver: \\);
    },
  });
}

/**
 * Delete driver
 */
export function useAdminDriverDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", driverId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toast.success("Driver deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(\Failed to delete driver: \\);
    },
  });
}

/**
 * Change driver status
 */
export function useAdminDriverStatusChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      status,
    }: {
      driverId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("drivers")
        .update({ status })
        .eq("id", driverId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      toast.success("Driver status updated");
    },
    onError: (error: Error) => {
      toast.error(\Failed to update driver status: \\);
    },
  });
}
