import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrips = (routeId: string) => {
  return useQuery({
    queryKey: ['trips', routeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, routes(*), vehicles(*), drivers(*), seats(*)')
        .eq('route_id', routeId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!routeId,
  });
};
