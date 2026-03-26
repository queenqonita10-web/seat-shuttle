import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useAuth } from '@/hooks/useAuth';
import { useTrips } from '@/hooks/useTrips'; // Assuming useTrips can fetch trips for a specific driver
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DriverDashboard = () => {
  const { user } = useAuth();
  // Assuming the user object has a driver_id property after login
  const driverId = user?.driver_id || null;
  const { error: locationError } = useDriverLocation(driverId);

  // Fetch trips assigned to this driver
  const { data: trips = [], isLoading } = useTrips({ driverId });

  const upcomingTrip = trips.find(t => t.status === 'scheduled');

  const handleStartTrip = async (tripId: number) => {
    // Logic to start a trip will be implemented in a later step
    console.log(`Starting trip ${tripId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Driver Dashboard</h1>
      {locationError && <p className="text-red-500">Location Error: {locationError}</p>}
      
      {isLoading ? (
        <p>Loading trips...</p>
      ) : upcomingTrip ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Route:</strong> {upcomingTrip.routes.name}</p>
            <p><strong>Departure:</strong> {new Date(upcomingTrip.departure_time).toLocaleString()}</p>
            <p><strong>Vehicle:</strong> {upcomingTrip.vehicles.brand} {upcomingTrip.vehicles.model}</p>
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
