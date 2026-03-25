import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { routes } from "@/data/mockData";
import { RouteTimeline } from "@/components/RouteTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Route } from "lucide-react";

export default function PickupRoute() {
  const navigate = useNavigate();
  const { selectedTrip, pickupPoint } = useBooking();

  if (!selectedTrip || !pickupPoint) {
    navigate("/");
    return null;
  }

  const route = routes.find((r) => r.id === selectedTrip.routeId);
  if (!route) return null;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
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

      <div className="mx-auto max-w-md px-5 mt-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your pickup: {pickupPoint.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <RouteTimeline
              pickupPoints={route.pickupPoints}
              selectedPointId={pickupPoint.id}
              departureTime={selectedTrip.departureTime}
              destination={route.destination}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
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
