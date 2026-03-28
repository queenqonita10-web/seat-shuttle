import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminBookingTrends = () => {
  return useQuery({
    queryKey: ['admin', 'bookingTrends'],
    queryFn: async () => {
      // get_daily_booking_trends RPC doesn't exist, return empty
      return [] as { day: string; bookings: number }[];
    },
  });
};
