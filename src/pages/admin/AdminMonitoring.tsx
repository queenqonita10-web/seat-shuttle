import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trips, routes, drivers, mockBookings } from "@/data/mockData";
import { MapPin, Bus, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminMonitoring() {
  const activeTrips = trips.filter(t => t.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Real-Time Monitoring</h2>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="h-3 w-3 mr-1 text-green-500" /> Live Updates
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTrips.map((trip) => {
          const route = routes.find(r => r.id === trip.routeId);
          const driver = drivers.find(d => d.id === trip.driverId);
          const tripBookings = mockBookings.filter(b => b.tripId === trip.id);
          const pickedUpCount = tripBookings.filter(b => b.status === "picked_up").length;
          const noShowCount = tripBookings.filter(b => b.status === "no_show").length;
          const pendingCount = tripBookings.filter(b => b.status === "pending").length;
          const progress = (pickedUpCount + noShowCount) / (tripBookings.length || 1) * 100;

          return (
            <Card key={trip.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bus className="h-5 w-5 text-primary" />
                      {route?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {driver?.name} • {trip.departureTime}
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Trip Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Picked</p>
                    <p className="text-xl font-bold text-green-600">{pickedUpCount}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pending</p>
                    <p className="text-xl font-bold text-blue-600">{pendingCount}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">No Show</p>
                    <p className="text-xl font-bold text-red-600">{noShowCount}</p>
                  </div>
                </div>

                {/* Stops Timeline (mini) */}
                <div className="relative pl-6 border-l-2 border-muted-foreground/20 space-y-4 py-2">
                  {route?.pickupPoints.slice(0, 3).map((stop, idx) => {
                    const isPassed = idx < 1; // mock passed status
                    return (
                      <div key={stop.id} className="relative">
                        <div className={cn(
                          "absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 bg-background",
                          isPassed ? "border-green-500 bg-green-500" : "border-muted-foreground/40"
                        )} />
                        <div className="flex justify-between items-center">
                          <p className={cn("text-sm", isPassed ? "text-foreground font-medium" : "text-muted-foreground")}>
                            {stop.label}
                          </p>
                          {isPassed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                        </div>
                      </div>
                    );
                  })}
                  {route && route.pickupPoints.length > 3 && (
                    <p className="text-xs text-muted-foreground italic">+ {route.pickupPoints.length - 3} more stops</p>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    <MapPin className="h-4 w-4" />
                    <span>Last location: 2 mins ago near J4</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
