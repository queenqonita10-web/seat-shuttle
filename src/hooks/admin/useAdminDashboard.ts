import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Trip { id: string; status: string; }
interface Booking { id: string; fare: number; payment_status: string; created_at: string; }
interface Driver { id: string; status: string; }

export interface DashboardStats {
  activeTrips: number;
  totalRevenue: number;
  activeDrivers: number;
  monthlyUsers: number;
  totalBookings: number;
  completedTrips: number;
}

/**
 * Fetch aggregated dashboard statistics
 * Queries trips, bookings, and drivers to calculate key metrics
 */
export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      // Fetch aggregated statistics from database tables
      const [tripsResult, bookingsResult, driversResult] = await Promise.all([
        supabase.from("trips").select("id, status"),
        supabase
          .from("bookings")
          .select("id, fare, payment_status")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("drivers").select("id, status"),
      ]);

      // Check for errors
      if (tripsResult.error) throw new Error(tripsResult.error.message);
      if (bookingsResult.error) throw new Error(bookingsResult.error.message);
      if (driversResult.error) throw new Error(driversResult.error.message);

      const trips = (tripsResult.data || []) as Trip[];
      const bookings = (bookingsResult.data || []) as Booking[];
      const drivers = (driversResult.data || []) as Driver[];

      // Calculate total revenue from completed bookings
      const completedBookings = bookings.filter(
        (b: Booking) => b.payment_status === "COMPLETED"
      );
      const totalRevenue = completedBookings.reduce(
        (sum: number, b: Booking) => sum + (b.fare || 0),
        0
      );

      const stats: DashboardStats = {
        activeTrips: trips.filter((t: Trip) => t.status === "ONGOING").length,
        totalRevenue,
        activeDrivers: drivers.filter((d: Driver) => d.status === "active").length,
        monthlyUsers: bookings.length,
        totalBookings: bookings.length,
        completedTrips: trips.filter((t: Trip) => t.status === "COMPLETED").length,
      };

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Subscribe to real-time dashboard updates
 * Invalidates dashboard cache when trips or bookings change
 */
export function useAdminDashboardRealtimeSubscription() {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates for dashboard
  const subscription = supabase
    .channel("admin-dashboard")
    .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    })
    .subscribe();

  return () => subscription.unsubscribe();
}

/**
 * Manually refresh dashboard data
 */
export function useRefreshAdminDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.refetchQueries({ queryKey: ["admin-dashboard"] });
    },
    onSuccess: () => {
      toast.success("Dashboard updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update dashboard");
      console.error(error);
    },
  });
}
