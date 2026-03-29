import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTickets = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // First get booking IDs for this user
      const { data: userBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id);
      const bookingIds = userBookings?.map(b => b.id) || [];
      if (bookingIds.length === 0) return [];
      const { data, error } = await supabase
        .from('tickets')
        .select('*, bookings(*)')
        .in('booking_id', bookingIds);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });
};
