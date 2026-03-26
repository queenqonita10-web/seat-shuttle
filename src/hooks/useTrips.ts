import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrips = (routeIds: string[]) => {
  return useQuery({
    queryKey: ['trips', routeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, routes(*), vehicles(*), drivers(*), seats(*)')
        .in('route_id', routeIds);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!routeIds && routeIds.length > 0,
  });
};
