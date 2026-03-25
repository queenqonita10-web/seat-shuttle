import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { pickupPoints, routes, formatPrice, getPickupTime, trips } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Armchair, Clock, CheckCircle, QrCode, Navigation, User, Phone } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function ETicket() {
  const navigate = useNavigate();
  const { booking } = useBooking();

  if (!booking) {
    navigate("/");
    return null;
  }


  const trip = trips.find((t) => t.id === booking.tripId);
  const pickup = pickupPoints.find((p) => p.id === booking.pickupPointId);
  const route = trip ? routes.find((r) => r.id === trip.routeId) : null;
  const routePickup = route?.pickupPoints.find((p) => p.id === booking.pickupPointId);
  const pickupTime = trip && routePickup ? getPickupTime(trip.departureTime, routePickup) : "";
  const fare = routePickup?.fare ?? 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-5 pb-8 pt-12 text-primary-foreground text-center">
        <div className="mx-auto max-w-md">
          <CheckCircle size={48} className="mx-auto mb-2" />
          <h1 className="text-xl font-bold italic tracking-tighter uppercase">PYU-GO CONFIRMED!</h1>
          <p className="text-sm text-primary-foreground/80">Your e-ticket is ready</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 -mt-4 space-y-4">
        {/* Ticket card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-primary/5 p-4 text-center border-b border-dashed">
            <Badge className="bg-secondary text-secondary-foreground mb-2">
              <CheckCircle size={12} className="mr-1" /> Paid
            </Badge>
            <p className="text-xs text-muted-foreground font-mono mt-1">{booking.id}</p>
          </div>

          <CardContent className="p-5 space-y-4">
            {/* QR Code placeholder */}
            <div className="mx-auto h-40 w-40 rounded-xl bg-foreground/5 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <QrCode size={48} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Scan at boarding</span>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <User size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Penumpang</p>
                  <p className="text-sm font-medium">{booking.passengerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">No. Telepon</p>
                  <p className="text-sm font-medium">{booking.passengerPhone}</p>
                </div>
              </div>
              {route && (
                <div className="flex items-center gap-3">
                  <Navigation size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="text-sm font-medium">{route.name} → {route.destination}</p>
                  </div>
                </div>
              )}
              {pickup && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup Point</p>
                    <p className="text-sm font-medium">{pickup.label}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Time</p>
                  <p className="text-sm font-medium">{pickupTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Armchair size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Seat Number</p>
                  <p className="text-sm font-medium">#{booking.seatNumber}</p>
                </div>
              </div>
            </div>

            {trip && (
              <div className="pt-2 border-t text-right">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-primary">{formatPrice(fare)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button onClick={() => navigate("/track")} className="w-full h-11 font-semibold">
            Track Driver
          </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full h-11">
            Back to Home
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
