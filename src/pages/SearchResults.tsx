import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { routes, getTripsByRoute, getAvailableSeats, formatPrice, getPickupTime, getFareForPickup, getVehicleType } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Users, Bus } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchResults() {
  const navigate = useNavigate();
  const { pickupPoint, destination, setSelectedTrip } = useBooking();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!pickupPoint || !destination) {
    navigate("/");
    return null;
  }

  const matchingRoutes = routes.filter((r) => r.destination === destination);
  const allTrips = matchingRoutes.flatMap((r) => getTripsByRoute(r.id));

  const handleSelect = (tripId: string) => {
    const trip = allTrips.find((t) => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      navigate("/seats");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="bg-primary px-5 pb-5 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate("/")} className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80">
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-lg font-bold">{pickupPoint.label} → {destination}</h1>
          <p className="text-sm text-primary-foreground/70">{allTrips.length} trips available</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4 space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          : allTrips.map((trip) => {
              const route = matchingRoutes.find((r) => r.id === trip.routeId)!;
              const routePickup = route.pickupPoints.find((p) => p.id === pickupPoint.id);
              const fare = routePickup ? routePickup.fare : 0;
              const available = getAvailableSeats(trip);
              const pickupTime = routePickup
                ? getPickupTime(trip.departureTime, routePickup)
                : trip.departureTime;
              const vt = getVehicleType(trip.vehicleTypeId);

              return (
                <Card key={trip.id} className="border-0 shadow-sm animate-fade-up">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="font-semibold text-lg">{trip.departureTime}</span>
                        </div>
                        {/* Prominent pickup time */}
                        <div className="ml-[22px] mt-1 flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-secondary/15 text-secondary border-0 font-semibold">
                            🚏 Board at {pickupTime}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">{formatPrice(fare)}</span>
                        <p className="text-[10px] text-muted-foreground">from {pickupPoint.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-muted-foreground" />
                          {available <= 3 ? (
                            <Badge variant="destructive" className="text-[10px] px-2 py-0">
                              Only {available} left!
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{available} seats</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bus size={12} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{vt.name}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleSelect(trip.id)}>
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
