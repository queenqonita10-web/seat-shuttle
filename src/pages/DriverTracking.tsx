import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { pickupPoints } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bus, MapPin, Phone, Navigation } from "lucide-react";

export default function DriverTracking() {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [driverPosition, setDriverPosition] = useState(1);
  const [eta, setEta] = useState(15);

  const pickup = booking ? pickupPoints.find((p) => p.id === booking.pickupPointId) : null;
  const pickupOrder = pickup?.order ?? 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosition((prev) => {
        if (prev >= pickupOrder) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      setEta((prev) => Math.max(0, prev - 3));
    }, 3000);
    return () => clearInterval(interval);
  }, [pickupOrder]);

  const currentStop = pickupPoints.find((p) => p.order === driverPosition);
  const arrived = driverPosition >= pickupOrder;

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="bg-primary px-5 pb-5 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate("/eticket")} className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-lg font-bold">Track Your Driver</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4 space-y-4">
        {/* Simulated map */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-52 bg-muted relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10" />
            {/* Route visualization */}
            <div className="relative z-10 flex items-center gap-1 px-4 overflow-x-auto">
              {pickupPoints.slice(0, Math.max(pickupOrder + 2, 8)).map((point) => {
                const isDriver = point.order === driverPosition;
                const isPassed = point.order < driverPosition;
                const isPickup = point.id === pickup?.id;

                return (
                  <div key={point.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDriver
                            ? "border-shuttle-warning bg-shuttle-warning scale-125"
                            : isPickup
                            ? "border-primary bg-primary"
                            : isPassed
                            ? "border-muted-foreground/40 bg-muted-foreground/30"
                            : "border-border bg-card"
                        }`}
                      >
                        {isDriver && <Bus size={8} className="text-shuttle-warning-foreground" />}
                        {isPickup && !isDriver && <MapPin size={6} className="text-primary-foreground" />}
                      </div>
                      <span className="text-[8px] text-muted-foreground mt-1 whitespace-nowrap">{point.id}</span>
                    </div>
                    <div className="h-0.5 w-4 bg-border" />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Status card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center space-y-3">
            {arrived ? (
              <>
                <Badge className="bg-secondary text-secondary-foreground">
                  Driver Arrived!
                </Badge>
                <p className="text-sm text-muted-foreground">Your driver is at {pickup?.label}</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-shuttle-warning animate-pulse-dot" />
                  <span className="text-sm font-medium">Driver is approaching</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Currently at <span className="font-semibold text-foreground">{currentStop?.label}</span>
                </p>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Clock size={20} />
                  <span>{eta} min</span>
                </div>
                <p className="text-xs text-muted-foreground">Estimated arrival</p>
              </>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full h-11 gap-2">
          <Phone size={16} />
          Contact Driver
        </Button>
      </div>
    </div>
  );
}

function Clock({ size, ...props }: { size: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
