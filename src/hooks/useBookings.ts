import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUserBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookings", "user", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBookingsForTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ["bookings", "trip", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("trip_id", tripId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tripId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (booking: {
      tripId: string;
      seatNumber: string;
      pickupPointId: string;
      passengerName: string;
      passengerPhone: string;
      paymentMethod: string;
      fare: number;
    }) => {
      const bookingId = `BK-${Date.now()}`;
      const ticketId = `TKT-${Date.now()}`;

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        id: bookingId,
        trip_id: booking.tripId,
        user_id: user?.id ?? null,
        seat_number: booking.seatNumber,
        pickup_point_id: booking.pickupPointId,
        passenger_name: booking.passengerName,
        passenger_phone: booking.passengerPhone,
        payment_method: booking.paymentMethod,
        payment_status: "paid",
        status: "pending",
        fare: booking.fare,
      });

      if (bookingError) throw bookingError;

      // Update seat status
      await supabase
        .from("seats")
        .update({ status: "booked" })
        .eq("trip_id", booking.tripId)
        .eq("seat_number", booking.seatNumber);

      // Get trip info for ticket
      const { data: trip } = await supabase
        .from("trips")
        .select("route_id, departure_time, departure_date")
        .eq("id", booking.tripId)
        .maybeSingle();

      // Create ticket
      if (trip) {
        await supabase.from("tickets").insert({
          id: ticketId,
          booking_id: bookingId,
          trip_id: booking.tripId,
          route_id: trip.route_id,
          seat_number: booking.seatNumber,
          departure_date: trip.departure_date,
          departure_time: trip.departure_time,
          pickup_point_id: booking.pickupPointId,
          status: "active",
          tracking_status: "scheduled",
        });
      }

      return { bookingId, ticketId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
