import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDriverLocation = (driverId: string | null) => {
  const { isDriver } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId || !isDriver) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { error: updateError } = await supabase
          .from('driver_locations')
          .upsert({ driver_id: driverId, lat: latitude, lng: longitude });

        if (updateError) {
          console.error('Error updating driver location:', updateError);
          setError(updateError.message);
        }
      },
      (err) => {
        console.error('Error getting geolocation:', err);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [driverId, isDriver]);

  return { error };
};
