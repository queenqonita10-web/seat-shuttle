import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { useRoutes } from "@/hooks/useRoutes";
import { formatPrice, getPickupTime } from "@/lib/formatters";
import { RouteTimeline } from "@/components/RouteTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Route, MapPin, Clock, Navigation } from "lucide-react";

export default function PickupRoute() {
  const navigate = useNavigate();
  const { selectedTrip, pickupPoint } = useBooking();
  const { data: routes = [] } = useRoutes();

  if (!selectedTrip || !pickupPoint) {
    navigate("/");
    return null;
  }

  const route = routes.find((r) => r.id === selectedTrip.route_id);
  if (!route) return null;

  const routePickup = route.pickup_points.find((p) => p.id === pickupPoint.id);
  const pickupTime = routePickup
    ? getPickupTime(selectedTrip.departure_time, routePickup)
    : selectedTrip.departure_time;
  const lastPoint = route.pickup_points[route.pickup_points.length - 1];
  const arrivalTime = getPickupTime(selectedTrip.departure_time, {
    time_offset: (lastPoint?.time_offset ?? 0) + 15,
  });

  // Convert pickup_points to RouteTimeline format
  const timelinePoints = route.pickup_points.map((p) => ({
    id: p.id,
    label: p.label,
    sort_order: p.sort_order,
    time_offset: p.time_offset,
    fare: p.fare,
  }));

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="bg-primary px-5 pb-5 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate("/seats")} className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80">
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Route size={20} />
            Route Overview
          </h1>
          <p className="text-sm text-primary-foreground/70">{route.name} — {route.destination}</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4 space-y-3">
        <Card className="border-0 shadow-sm bg-secondary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Board at</p>
                  <p className="text-sm font-semibold text-foreground">{pickupPoint.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-secondary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-bold text-secondary">{pickupTime}</p>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-secondary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Arrive at {route.destination}</span>
              </div>
              <span className="text-xs font-medium text-foreground">~{arrivalTime}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Route Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <RouteTimeline
              pickupPoints={timelinePoints}
              selectedPointId={pickupPoint.id}
              departureTime={selectedTrip.departure_time}
              destination={route.destination}
            />
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card shadow-lg">
        <div className="mx-auto max-w-md p-4">
          <Button onClick={() => navigate("/checkout")} className="w-full h-11 font-semibold">
            Continue to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
