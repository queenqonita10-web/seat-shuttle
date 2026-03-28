import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Trip {
  id: string;
  route_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  vehicle_type_id: string;
  departure_date: string;
  departure_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TripFilters {
  status?: string;
  routeId?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface TripWithRelations extends Trip {
  routes?: { id: string; name: string } | null;
  vehicles?: { id: string; brand: string; model: string } | null;
  drivers?: { id: string; name: string; phone: string; status?: string } | null;
}

export function useAdminTrips(filters?: TripFilters) {
  return useQuery<TripWithRelations[]>({
    queryKey: ["admin-trips", filters],
    queryFn: async () => {
      let query = supabase.from("trips").select(`
        *,
        routes(id, name),
        vehicles(id, brand, model),
        drivers(id, name, phone, status)
      `);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.routeId) {
        query = query.eq("route_id", filters.routeId);
      }
      if (filters?.driverId) {
        query = query.eq("driver_id", filters.driverId);
      }
      if (filters?.dateFrom) {
        query = query.gte("departure_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("departure_date", filters.dateTo);
      }

      const { data, error } = await query.order("departure_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60,
  });
}

export function useAdminTripDetail(tripId: string) {
  return useQuery<TripWithRelations>({
    queryKey: ["admin-trip", tripId],
    enabled: !!tripId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          routes(id, name),
          vehicles(id, brand, model),
          drivers(id, name, phone)
        `)
        .eq("id", tripId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useAdminTripCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripData: Omit<Trip, "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("trips")
        .insert([tripData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
      toast.success("Trip created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create trip: ${error.message}`);
    },
  });
}

export function useAdminTripUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Trip>;
    }) => {
      const { data, error } = await supabase
        .from("trips")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
      toast.success("Trip updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update trip: ${error.message}`);
    },
  });
}

export function useAdminTripDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
      toast.success("Trip deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete trip: ${error.message}`);
    },
  });
}

export function useAdminTripStatusChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      status,
    }: {
      tripId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("trips")
        .update({ status })
        .eq("id", tripId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
      toast.success("Trip status updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update trip status: ${error.message}`);
    },
  });
}
