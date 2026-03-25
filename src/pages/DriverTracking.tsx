import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { useRoutes } from "@/hooks/useRoutes";
import { useVehicleTypes } from "@/hooks/useVehicles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bus, MapPin, Phone, Share2, Star, Check, User, Wifi, WifiOff, AlertCircle, Bell, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useRealTimeTracking } from "@/hooks/useRealTimeTracking";
import { useNotifications } from "@/hooks/useNotifications";
import { realtimeTrackingService } from "@/services/realtimeTrackingService";
import { notificationTriggerService } from "@/services/notificationTriggerService";

export default function DriverTracking() {
  const navigate = useNavigate();
  const { booking } = useBooking();

  const { data: routes = [] } = useRoutes();
  const { data: allTrips = [] } = useQuery({
    queryKey: ["trips-all"],
    queryFn: async () => {
      const { data } = await supabase.from("trips").select("*");
      return data || [];
    },
  });
  const { data: vehicleTypes = [] } = useVehicleTypes();

  const trip = booking ? allTrips.find((t) => t.id === booking.tripId) : null;
  const route = trip ? routes.find((r) => r.id === trip.route_id) : null;
  const pickup = booking && route ? route.pickup_points.find((p) => p.id === booking.pickupPointId) : null;
  const pickupOrder = pickup?.sort_order ?? 5;
  const vehicle = trip ? vehicleTypes.find((v) => v.id === trip.vehicle_type_id) : null;

  // Get driver ID from trip (or use mock)
  const driverId = trip?.driver_id || `DRV-${String(Math.floor(Math.random() * 100)).padStart(3, "0")}`;

  // Real-time tracking hook
  const { location: realtimeLocation, isConnected, error: rtError } = useRealTimeTracking(driverId, {
    autoSubscribe: true,
    onError: (error) => console.error("[DriverTracking] Tracking error:", error),
  });

  // Notifications hook
  const { notifications, unreadCount, markAsRead, unreadNotifications } = useNotifications();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Local state for position simulation / fallback
  const [driverPosition, setDriverPosition] = useState(1);
  const [eta, setEta] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [showMockWarning, setShowMockWarning] = useState(!isConnected);

  // Calculate approximate position from real location (fallback to simulated)
  const estimatedPosition = realtimeLocation?.lat && realtimeLocation?.lng 
    ? Math.min(pickupOrder, Math.floor(driverPosition * 1.2)) // Estimated based on bearing
    : driverPosition;

  // Use fallback simulation if no real-time data
  useEffect(() => {
    if (realtimeLocation) {
      // Real location received - update warning status
      setShowMockWarning(false);
    } else {
      // No real location - run simulation as fallback
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
    }
  }, [realtimeLocation, pickupOrder]);

  // Countdown seconds ticker
  useEffect(() => {
    if (estimatedPosition >= pickupOrder) return;
    const timer = setInterval(() => {
      setSeconds((prev) => (prev === 0 ? 59 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [estimatedPosition, pickupOrder]);

  // Initialize realtime service and notification triggers on mount
  useEffect(() => {
    if (!booking || !trip || !pickup) return;

    const setupTracking = async () => {
      // Initialize realtime service
      await realtimeTrackingService.initialize().catch((error) => {
        console.error("[DriverTracking] Failed to initialize realtime service:", error);
      });

      // Initialize notification trigger service
      await notificationTriggerService.initialize({
        enabled: true,
        nearbyDistance: 1000, // 1km
        arrivedDistance: 100, // 100m
        etaThreshold: 5, // 5 minutes
      });

      // Setup location listener for this driver and pickup
      const cleanup = notificationTriggerService.setupLocationListener(
        driverId,
        -6.2, // Default coordinates (pickup_points table has no lat/lng)
        106.8,
        pickup.label
      );

      console.info("[DriverTracking] Notification triggers enabled for", driverId);

      return cleanup;
    };

    let cleanup: (() => void) | null = null;

    setupTracking()
      .then((fn) => {
        cleanup = fn;
      })
      .catch((error) => {
        console.error("[DriverTracking] Tracking setup error:", error);
      });

    // Cleanup on unmount
    return () => {
      cleanup?.();
    };
  }, [booking, trip, pickup, driverId]);

  const arrived = estimatedPosition >= pickupOrder;
  const progressPercent = Math.min(100, (estimatedPosition / pickupOrder) * 100);

  // Relevant stops: from start to user's pickup
  const relevantStops = (route?.pickup_points || []).filter((p) => p.sort_order <= pickupOrder).sort((a, b) => a.sort_order - b.sort_order);
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-primary px-5 pb-4 pt-12 text-primary-foreground">
          <div className="mx-auto max-w-md">
            <h1 className="text-lg font-bold">PYU-GO Tracking</h1>
          </div>
        </div>
        <div className="mx-auto max-w-md px-5 mt-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">Belum ada perjalanan aktif</p>
                <p className="text-sm text-muted-foreground">Pesan tiket dulu untuk mulai tracking driver kamu</p>
              </div>
              <Button onClick={() => navigate("/")} className="h-11 px-6">
                Cari Perjalanan
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <h1 className="text-lg font-bold">PYU-GO Tracking</h1>
            <div className="flex items-center gap-2">
              {/* Notification center button */}
              <button
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-destructive rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Connection status */}
              <div className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi size={14} className="text-secondary animate-pulse" />
                    <span className="hidden sm:inline text-primary-foreground/80">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-destructive/70" />
                    <span className="hidden sm:inline text-primary-foreground/80">Polling</span>
                  </>
                )}
              </div>
              <Badge className="bg-destructive/90 text-destructive-foreground text-[10px] animate-pulse">
                ● LIVE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 mt-4 space-y-4">
        {/* Notification Center Drawer */}
        {showNotificationCenter && (
          <Card className="border-primary/30 bg-card shadow-lg fixed inset-x-0 top-0 z-50 max-w-md mx-auto rounded-b-lg rounded-t-none pt-[100px]">
            <CardContent className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between mb-4 sticky -top-4 bg-card pb-2">
                <h3 className="font-semibold">Notifications ({notifications.length})</h3>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`border-l-4 cursor-pointer transition ${
                      notif.read
                        ? 'border-l-border bg-muted/50'
                        : 'border-l-primary bg-primary/5'
                    }`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Real-time tracking error/warning */}
        {showMockWarning && (
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardContent className="p-3 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive/70 shrink-0 mt-0.5" />
              <div className="text-sm text-destructive/80">
                <p className="font-medium">Using simulated tracking</p>
                <p className="text-xs opacity-80 mt-0.5">Real-time data unavailable. Showing estimated position.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real location coordinates (debug info) */}
        {realtimeLocation && (
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-3 text-xs text-primary/70 font-mono">
              <div className="flex justify-between">
                <span>Lat: {realtimeLocation.lat.toFixed(4)}</span>
                <span>Lng: {realtimeLocation.lng.toFixed(4)}</span>
              </div>
              {realtimeLocation.speed && <div>Speed: {realtimeLocation.speed.toFixed(1)} km/h</div>}
            </CardContent>
          </Card>
        )}

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
              {pathD && estimatedPosition > 0 && (
                <path
                  d={`M ${pathPoints
                    .slice(0, estimatedPosition)
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
                const isPassed = stop.sort_order < estimatedPosition;
                const isCurrent = stop.sort_order === estimatedPosition;
                const isUserStop = stop.id === pickup?.id;

                return (
                  <g key={stop.id}>
                    {/* Pulse ring for current */}
                    {isCurrent && !arrived && (
                      <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="hsl(var(--pyugo-warning))" strokeWidth="1.5" opacity="0.5">
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
                          ? "hsl(var(--pyugo-warning))"
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
                  <Star key={s} size={10} className={s <= 4 ? "fill-pyugo-warning text-pyugo-warning" : "text-border"} />
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
                const isPassed = stop.sort_order < estimatedPosition;
                const isCurrent = stop.sort_order === estimatedPosition && !arrived;
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
                            ? "border-pyugo-warning bg-pyugo-warning"
                            : isPassed
                            ? "border-primary bg-primary"
                            : "border-border bg-card"
                        }`}
                      >
                        {(isPassed || (arrived && isUserStop)) && (
                          <Check size={10} className="text-primary-foreground" />
                        )}
                        {isCurrent && (
                          <Bus size={10} className="text-pyugo-warning-foreground" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-6 ${isPassed || isCurrent ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>

                    {/* Stop info */}
                    <div className={`pb-4 -mt-0.5 ${isUserStop ? "font-semibold" : ""}`}>
                      <p className={`text-sm leading-tight ${isCurrent ? "text-pyugo-warning" : isUserStop ? "text-primary" : isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                        {stop.label}
                        {isUserStop && <MapPin size={12} className="inline ml-1 text-primary" />}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] text-pyugo-warning">Driver is here</span>
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

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 space-y-2 pointer-events-none">
        {unreadNotifications.slice(-2).map((notif) => (
          <Card key={notif.id} className="border-l-4 border-l-primary bg-primary/10 backdrop-blur shadow-lg pointer-events-auto animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-primary">{notif.title}</p>
                  <p className="text-xs text-foreground/80 mt-1">{notif.body}</p>
                </div>
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="p-1 hover:bg-primary/20 rounded shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
