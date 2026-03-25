import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;

interface BookingFilters {
  status?: string;
  paymentStatus?: string;
  tripId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Fetch all admin bookings with optional filters
 */
export function useAdminBookings(filters?: BookingFilters) {
  return useQuery<Booking[]>({
    queryKey: ["admin-bookings", filters],
    queryFn: async () => {
      let query = supabase.from("bookings").select("*");

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.paymentStatus) {
        query = query.eq("payment_status", filters.paymentStatus);
      }
      if (filters?.tripId) {
        query = query.eq("trip_id", filters.tripId);
      }
      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single booking details
 */
export function useAdminBookingDetail(bookingId: string) {
  return useQuery<Booking>({
    queryKey: ["admin-booking", bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

/**
 * Create new booking
 */
export function useAdminBookingCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: Omit<Booking, "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });
}

/**
 * Update booking
 */
export function useAdminBookingUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Booking>;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });
}

/**
 * Delete booking
 */
export function useAdminBookingDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete booking: ${error.message}`);
    },
  });
}

/**
 * Cancel booking (soft delete with status update)
 */
export function useAdminBookingCancel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel booking: ${error.message}`);
    },
  });
}
