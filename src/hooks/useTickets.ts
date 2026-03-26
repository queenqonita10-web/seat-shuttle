import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTickets = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tickets')
        .select('*, bookings(*, trips(*, routes(*)))')
        .in('booking_id', (await supabase.from('bookings').select('id').eq('passenger_id', user.id)).data?.map(b => b.id) || []);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });
};
