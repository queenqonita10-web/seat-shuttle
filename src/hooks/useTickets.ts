import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TicketRow {
  id: string;
  booking_id: string;
  trip_id: string;
  route_id: string;
  seat_number: string;
  departure_date: string;
  departure_time: string;
  pickup_point_id: string;
  status: string;
  tracking_status: string;
  created_at: string;
  updated_at: string;
}

export function useUserTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tickets", "user", user?.id],
    queryFn: async (): Promise<TicketRow[]> => {
      if (!user) return [];
      // Tickets are linked via bookings.user_id through RLS
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useTicketById(ticketId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tickets", "detail", ticketId],
    queryFn: async (): Promise<TicketRow | null> => {
      if (!ticketId) return null;
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId && !!user,
  });
}
