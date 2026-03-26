import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminBookingTrends = () => {
  return useQuery({
    queryKey: ['admin', 'bookingTrends'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_booking_trends');
      if (error) throw new Error(error.message);
      return data;
    },
  });
};
