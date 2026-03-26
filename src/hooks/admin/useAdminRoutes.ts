import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Route = Tables<"routes">;
type PickupPoint = Tables<"pickup_points">;

interface RouteWithPickups extends Route {
  pickup_points?: PickupPoint[];
}

export function useAdminRoutes() {
  return useQuery<RouteWithPickups[]>({
    queryKey: ["admin-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`*, pickup_points(*)`)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60,
  });
}

export function useAdminRouteDetail(routeId: string) {
  return useQuery<RouteWithPickups>({
    queryKey: ["admin-route", routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`*, pickup_points(*)`)
        .eq("id", routeId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useAdminRouteCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeData: Omit<Route, "created_at">) => {
      const { data, error } = await supabase
        .from("routes")
        .insert([routeData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routes"] });
      toast.success("Route created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create route: ${error.message}`);
    },
  });
}

export function useAdminRouteUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: RouteUpdate;
    }) => {
      const { data, error } = await supabase
        .from("routes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routes"] });
      toast.success("Route updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update route: ${error.message}`);
    },
  });
}

export function useAdminRouteDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from("routes")
        .update({ is_deleted: true, status: 'inactive' })
        .eq("id", routeId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routes"] });
      toast.success("Route deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete route: ${error.message}`);
    },
  });
}
