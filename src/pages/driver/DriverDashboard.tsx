import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DriverTrip {
  id: string;
  status: string;
  departure_time: string;
  departure_date: string;
  routes: { name: string } | null;
  vehicles: { brand: string; model: string } | null;
}

const DriverDashboard = () => {
  const { user, isDriver } = useAuth();
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isDriver) return;

    const fetchDriverTrips = async () => {
      // Find driver record for this user
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!driver) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('trips')
        .select('id, status, departure_time, departure_date, routes(name), vehicles(brand, model)')
        .eq('driver_id', driver.id)
        .order('departure_date', { ascending: true });

      setTrips((data as DriverTrip[]) || []);
      setIsLoading(false);
    };

    fetchDriverTrips();
  }, [user, isDriver]);

  const upcomingTrip = trips.find(t => t.status === 'scheduled' || t.status === 'pending');

  const handleStartTrip = async (tripId: string) => {
    console.log(`Starting trip ${tripId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Driver Dashboard</h1>

      {isLoading ? (
        <p>Loading trips...</p>
      ) : upcomingTrip ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Route:</strong> {upcomingTrip.routes?.name ?? '—'}</p>
            <p><strong>Departure:</strong> {upcomingTrip.departure_date} {upcomingTrip.departure_time}</p>
            <p><strong>Vehicle:</strong> {upcomingTrip.vehicles ? `${upcomingTrip.vehicles.brand} ${upcomingTrip.vehicles.model}` : '—'}</p>
            <Button onClick={() => handleStartTrip(upcomingTrip.id)} className="mt-4">
              Start Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p>No upcoming trips assigned.</p>
      )}
    </div>
  );
};

export default DriverDashboard;
