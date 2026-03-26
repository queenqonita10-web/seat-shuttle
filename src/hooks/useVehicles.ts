import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*, vehicle_types(*)');
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useVehicleTypes = () => {
  return useQuery({
    queryKey: ['vehicle_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicle_types').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
  });
};
