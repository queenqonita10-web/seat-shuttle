import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { pickupPoints, getVehicleType, trips } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bus, MapPin, Phone, Share2, Star, Check, User } from "lucide-react";

export default function DriverTracking() {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [driverPosition, setDriverPosition] = useState(1);
  const [eta, setEta] = useState(15);
  const [seconds, setSeconds] = useState(0);

  const pickup = booking ? pickupPoints.find((p) => p.id === booking.pickupPointId) : null;
  const pickupOrder = pickup?.order ?? 5;

  const trip = booking ? trips.find((t) => t.id === booking.tripId) : null;
  const vehicle = trip ? getVehicleType(trip.vehicleTypeId) : null;

  // Relevant stops: from start to user's pickup
  const relevantStops = pickupPoints.filter((p) => p.order <= pickupOrder).sort((a, b) => a.order - b.order);

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
    }, 4000);
    return () => clearInterval(interval);
  }, [pickupOrder]);

  // Countdown seconds ticker
  useEffect(() => {
    if (driverPosition >= pickupOrder) return;
    const timer = setInterval(() => {
      setSeconds((prev) => (prev === 0 ? 59 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [driverPosition, pickupOrder]);

  const arrived = driverPosition >= pickupOrder;
  const progressPercent = Math.min(100, (driverPosition / pickupOrder) * 100);

  // SVG path points for the simulated route
  const totalStops = relevantStops.length;
  const pathPoints = relevantStops.map((_, i) => {
    const x = 30 + (i / Math.max(totalStops - 1, 1)) * 290;
    const y = 60 + Math.sin((i / Math.max(totalStops - 1, 1)) * Math.PI) * -25;
    return { x, y };
  });

  const pathD =
    pathPoints.length > 1
      ? `M ${pathPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`
      : "";

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-primary px-5 pb-4 pt-12 text-primary-foreground">
        <div className="mx-auto max-w-md">
          <button
            onClick={() => navigate("/eticket")}
            className="mb-3 flex items-center gap-1 text-sm text-primary-foreground/80"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Track Your Driver</h1>
            <Badge className="bg-destructive/90 text-destructive-foreground text-[10px] animate-pulse">
              ● LIVE
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4 space-y-4">
        {/* Simulated Map */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-48 bg-muted relative">
            {/* Grid pattern background */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10" />

            {/* Route SVG */}
            <svg viewBox="0 0 350 120" className="relative z-10 w-full h-full">
              {/* Route line background */}
              {pathD && (
                <path d={pathD} fill="none" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
              )}
              {/* Traveled portion */}
              {pathD && driverPosition > 0 && (
                <path
                  d={`M ${pathPoints
                    .slice(0, driverPosition)
                    .map((p) => `${p.x},${p.y}`)
                    .join(" L ")}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Stop markers */}
              {pathPoints.map((pt, i) => {
                const stop = relevantStops[i];
                const isPassed = stop.order < driverPosition;
                const isCurrent = stop.order === driverPosition;
                const isUserStop = stop.id === pickup?.id;

                return (
                  <g key={stop.id}>
                    {/* Pulse ring for current */}
                    {isCurrent && !arrived && (
                      <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="hsl(var(--shuttle-warning))" strokeWidth="1.5" opacity="0.5">
                        <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isCurrent ? 6 : isUserStop ? 5 : 4}
                      fill={
                        isCurrent
                          ? "hsl(var(--shuttle-warning))"
                          : isUserStop
                          ? "hsl(var(--primary))"
                          : isPassed
                          ? "hsl(var(--muted-foreground))"
                          : "hsl(var(--border))"
                      }
                      stroke="hsl(var(--card))"
                      strokeWidth="2"
                    />
                    {/* Bus icon at driver position */}
                    {isCurrent && !arrived && (
                      <text x={pt.x} y={pt.y - 14} textAnchor="middle" fontSize="14">🚐</text>
                    )}
                    {/* Label */}
                    <text
                      x={pt.x}
                      y={pt.y + 18}
                      textAnchor="middle"
                      fontSize="7"
                      fill={isUserStop ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      fontWeight={isUserStop ? "bold" : "normal"}
                    >
                      {stop.id}
                    </text>
                    {isUserStop && (
                      <text x={pt.x} y={pt.y + 26} textAnchor="middle" fontSize="5.5" fill="hsl(var(--primary))">
                        YOUR STOP
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Arrived check */}
              {arrived && pickup && (
                <g>
                  <circle cx={pathPoints[pathPoints.length - 1]?.x} cy={pathPoints[pathPoints.length - 1]?.y} r="10" fill="hsl(var(--secondary))" />
                  <text
                    x={pathPoints[pathPoints.length - 1]?.x}
                    y={pathPoints[pathPoints.length - 1]?.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fill="hsl(var(--secondary-foreground))"
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                </g>
              )}
            </svg>
          </div>
        </Card>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* ETA or Arrived */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center space-y-2">
            {arrived ? (
              <div className="space-y-3 animate-fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                  <Check className="h-7 w-7 text-secondary" />
                </div>
                <p className="text-lg font-bold text-secondary">Driver Has Arrived!</p>
                <p className="text-sm text-muted-foreground">
                  Your driver is waiting at <span className="font-semibold text-foreground">{pickup?.label}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Arriving in</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-4xl font-bold text-primary tabular-nums">{eta}</span>
                  <span className="text-lg text-muted-foreground">:</span>
                  <span className="text-4xl font-bold text-primary tabular-nums">
                    {String(seconds).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">min : sec</p>
                <p className="text-sm text-muted-foreground mt-2">
                  to <span className="font-semibold text-foreground">{pickup?.label}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver info */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Pak Ahmad</p>
              <p className="text-xs text-muted-foreground">{vehicle?.name ?? "HI ACE"} · B 1234 XY</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} className={s <= 4 ? "fill-shuttle-warning text-shuttle-warning" : "text-border"} />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1">4.8</span>
              </div>
            </div>
            <Button size="icon" variant="outline" className="h-10 w-10 rounded-full shrink-0">
              <Phone size={16} />
            </Button>
          </CardContent>
        </Card>

        {/* Vertical timeline */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Route Stops</p>
            <div className="space-y-0">
              {relevantStops.map((stop, i) => {
                const isPassed = stop.order < driverPosition;
                const isCurrent = stop.order === driverPosition && !arrived;
                const isUserStop = stop.id === pickup?.id;
                const isLast = i === relevantStops.length - 1;

                return (
                  <div key={stop.id} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          arrived && isUserStop
                            ? "border-secondary bg-secondary"
                            : isCurrent
                            ? "border-shuttle-warning bg-shuttle-warning"
                            : isPassed
                            ? "border-primary bg-primary"
                            : "border-border bg-card"
                        }`}
                      >
                        {(isPassed || (arrived && isUserStop)) && (
                          <Check size={10} className="text-primary-foreground" />
                        )}
                        {isCurrent && (
                          <Bus size={10} className="text-shuttle-warning-foreground" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-6 ${isPassed || isCurrent ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>

                    {/* Stop info */}
                    <div className={`pb-4 -mt-0.5 ${isUserStop ? "font-semibold" : ""}`}>
                      <p className={`text-sm leading-tight ${isCurrent ? "text-shuttle-warning" : isUserStop ? "text-primary" : isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                        {stop.label}
                        {isUserStop && <MapPin size={12} className="inline ml-1 text-primary" />}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] text-shuttle-warning">Driver is here</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-11 gap-2">
            <Phone size={16} />
            Call Driver
          </Button>
          <Button variant="outline" className="flex-1 h-11 gap-2">
            <Share2 size={16} />
            Share Location
          </Button>
        </div>

        <button className="w-full text-center text-sm text-destructive py-2">
          Cancel Ride
        </button>
      </div>
    </div>
  );
}
